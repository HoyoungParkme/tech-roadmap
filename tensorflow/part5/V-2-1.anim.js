/* V-2-1 Keras 3 멀티 백엔드 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 백엔드 이름·ops.matmul 결과·파라미터 수·compute_loss 동작은 venv(Keras 3.15.1, TF·torch 백엔드)에서 확인했다. JAX 는 설치돼 있지 않아 돌리지 못했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, dot, zone, cross, check, terminal, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  const ENG = { tf: ['TensorFlow', WARN, WARNBG], jax: ['JAX', INFO, INFOBG], torch: ['PyTorch', BAD, BADBG], theano: ['Theano', MUT, SOFT] };
  function eng(cx, cy, key, o) { o = o || {}; const [n, col, bg] = ENG[key], w = o.w || 96;
    return card(cx, cy, w, o.h || 40, { rx: 6, text: o.text || n, fs: o.fs || 14, fw: 800, stroke: o.dim ? GRID : col, fill: o.dim ? PANEL : bg, color: o.dim ? OFF : col, s: o.s, op: o.op, sw: o.on ? 3.2 : 2 }); }
  const kblk = (cx, cy, w, text, o) => { o = o || {}; return card(cx, cy, w, o.h || 40, { rx: 8, text, fs: 15, fw: 800, stroke: ACC, fill: ACCBG, color: ACC, s: o.s, op: o.op, mono: o.mono }); };

  // ---------- 1. 독립 → 흡수 → 재독립 ----------
  const YR = [['2015', 140, '독립'], ['2019', 380, '흡수'], ['2021', 620, '공존'], ['2023', 840, 'Keras 3']];
  function s1(t, c) { const { k, u } = c;
    const nY = [1, 2, 2, 3, 4, 4, 4][k], newY = [0, 1, -1, 2, 3, -1, -1][k];
    grow(60, 330, 910, 330, 1, GRID, { plain: true, sw: 3 });
    YR.forEach(([y, x, tag], i) => { if (i >= nY) return; const s = i === newY ? pop(u, 0.2) : 1;
      el('circle', { cx: x, cy: 330, r: 9 * s, fill: i === 3 ? ACC : INK });
      mono(x, 364, y, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: s }); sub(x, 388, tag, s, { 'font-size': 14 }); });
    const ap = (i) => (i === newY ? pop(u, 0.5) : 1);
    // 2015: Keras 가 TF·Theano 위에
    kblk(140, 140, 190, 'Keras', { s: ap(0) }); eng(92, 196, 'tf', { s: ap(0), w: 90 }); eng(188, 196, 'theano', { s: ap(0), w: 90 });
    if (nY >= 2) { // 2019: TF 안으로
      card(380, 170, 200, 130, { rx: 12, stroke: WARN, fill: WARNBG, s: ap(1) }); tx(380, 128, 'TensorFlow 2', { 'font-size': 15, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: ap(1) });
      kblk(380, 186, 150, 'tf.keras', { s: ap(1), mono: true });
      if (k === 1) fly(140, 140, 380, 186, seg(u, 0.5, 1.4), 'Keras', { fill: ACC });
      if (k === 2) { card(380, 270, 300, 40, { rx: 6, text: 'from tensorflow import keras', fs: 14, mono: true, fw: 700, stroke: WARN, color: INK, s: pop(u, 0.3) });
        grow(380, 248, 380, 210, E(u, 0.9, 1.3), WARN); note(620, 140, 'TF 없이는 못 쓰는 API', fade(u, 1.5), { 'text-anchor': 'middle', fill: WARN }); sub(620, 166, '엔진을 바꿀 선택지가 없다', fade(u, 1.8), { 'font-size': 14 }); cross(620, 220, 14, pop(u, 2.0)); } }
    if (nY >= 3) { // 2021: 세 엔진 공존
      ['tf', 'jax', 'torch'].forEach((e, i) => eng(620, 120 + i * 52, e, { w: 130, s: k === 3 ? pop(u, 0.5 + i * 0.2) : 1 }));
      if (k === 3) note(620, 290, '승자 한 명이 없다', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT, 'font-size': 14 }); }
    if (nY >= 3 && k >= 4) { // 2023
      ['jax', 'tf', 'torch'].forEach((e, i) => eng(780 + i * 62, 220, e, { w: 58, fs: 13.5, text: ['JAX', 'TF', 'torch'][i], s: k === 4 ? pop(u, 0.9 + i * 0.15) : 1 }));
      if (k === 4) { pill(840, 110, 'pip install keras', ACC, pop(u, 0.3), { mono: true, fs: 13.5 }); pill(840, 150, 'pip install jax …', INK, pop(u, 0.7), { mono: true, fs: 13.5 });
        sub(840, 270, '코어 따로, 엔진은 골라서', fade(u, 1.6), { 'font-size': 14 }); }
      if (k >= 5) { const d = k === 5 ? E(u, 0.3, 1.1) : 1; kblk(842, lerp(80, 168, d), 190, 'Keras 3');
        if (k === 5) { mono(842, 116, 'import keras', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
          mono(842, 274, 'keras.__version__ → 3.x', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.8) }); }
        if (k === 6) { [780, 842, 904].forEach((x, i) => dot([[842, 186], [x, 204]], seg(u, 0.3 + i * 0.2, 0.9 + i * 0.2), ACC, 5));
          note(480, 300, 'API 는 하나, 엔진은 갈아끼운다', fade(u, 1.0), { 'text-anchor': 'middle', fill: ACC, 'font-size': 16 }); } } } }

  // ---------- 2. 환경변수로 엔진 교체 ----------
  const SOCK = [['jax', 260], ['tf', 480], ['torch', 700]];
  function engines(active, o) { o = o || {}; SOCK.forEach(([e, x]) => { eng(x, 360, e, { w: 150, h: 48, fs: 15, dim: active && e !== active, on: e === active }); if (e === active && o.mark) mono(x, 400, '실행 중', { 'font-size': 13.5, 'text-anchor': 'middle', fill: ENG[e][1], 'font-weight': 700 }); }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { [[0, '① os.environ["KERAS_BACKEND"] = ...', '② import keras', true], [1, '① import keras', '② os.environ[...] = "jax"', false]].forEach(([i, a, b, ok]) => { const y = 100 + i * 170, s = pop(u, 0.3 + i * 0.8);
        card(330, y, 420, 40, { rx: 6, text: a, fs: 14, mono: true, fw: 700, stroke: ok ? GOOD : BAD, s }); card(330, y + 56, 420, 40, { rx: 6, text: b, fs: 14, mono: true, fw: 700, stroke: ok ? GOOD : BAD, s });
        if (ok) check(600, y + 28, 14, pop(u, 0.8)); else cross(600, y + 28, 14, pop(u, 1.6)); });
      note(700, 356, '먼저 import 하면 그 백엔드로 굳는다', fade(u, 2.0), { fill: BAD, 'text-anchor': 'middle' }); return; }
    const envOp = k === 1 ? pop(u, 0.2) : 1;
    card(480, 52, 460, 44, { rx: 8, text: 'os.environ["KERAS_BACKEND"] = "jax"', fs: 15, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: envOp });
    engines(k >= 1 ? 'jax' : null, { mark: k >= 4 });
    if (k === 1) { SOCK.forEach(([e, x], i) => sub(x, 410, '"' + (e === 'tf' ? 'tensorflow' : e) + '"', fade(u, 0.8 + i * 0.2), { 'font-size': 14 }));
      grow(480, 76, 260, 334, E(u, 1.2, 1.8), ACC); note(700, 200, '문자열만 바꾸면 엔진이 갈린다', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { terminal(250, 110, 460, 140, ['>>> import keras', '>>> keras.backend.backend()', ["'jax'", null]], E(u, 0.3, 1.8) * 3, { fs: 14 }); grow(480, 250, 290, 334, E(u, 1.8, 2.2), ACC); return; }
    // 모델 코드 층
    const L = ['model = keras.Sequential([', '    layers.Dense(64, activation="relu"),', '    layers.Dense(3, activation="softmax")])', 'model.compile(optimizer="adam", ...)', 'model.fit(x_train, y_train, epochs=5)'];
    if (k <= 4) { zone(150, 96, 660, 190, '내 코드 — 엔진이 바뀌어도 그대로', { fill: SOFT, op: k === 3 ? fade(u, 0.2) : 1 });
      L.forEach((s, i) => { const lit = k === 3 ? i < 3 : i >= 3, op = k === 3 ? fade(u, 0.3 + i * 0.15) : 1; mono(176, 146 + i * 28, s, { 'font-size': 14.5, opacity: op * (lit ? 1 : 0.4), fill: lit ? INK : MUT, 'font-weight': lit ? 700 : 400 }); });
      if (k === 3) { mono(780, 174, '파라미터', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.4) }); mono(780, 200, '4×64+64 + 64×3+3', { 'font-size': 13.5, 'text-anchor': 'end', opacity: fade(u, 1.6) });
        mono(780, 230, '= 515', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.9) }); sub(700, 410, '세 엔진 어디서나 같은 515개', fade(u, 2.2), { 'font-size': 14 }); return; }
      for (let j = 0; j < 4; j++) dot([[480, 290], [260, 334]], seg(u, 0.4 + j * 0.45, 1.0 + j * 0.45), INFO, 6);
      sub(560, 312, '실제 계산만 선택된 엔진이 한다', fade(u, 1.0), { 'font-size': 14 }); return; }
    // k5: keras.ops
    const M = (x, y, m, col, s) => m.forEach((r, i) => r.forEach((v, j) => card(x + j * 50, y + i * 46, 44, 40, { rx: 4, text: String(v), fs: 15, mono: true, fw: 800, stroke: col, color: col, s })));
    M(150, 130, [[1, 2], [3, 4]], INFO, pop(u, 0.2)); mono(225, 230, 'a', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700 });
    tx(290, 160, '@', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.4) });
    M(330, 130, [[1, 2], [3, 4]], INFO, pop(u, 0.4)); mono(405, 230, 'a', { 'font-size': 15, 'text-anchor': 'middle', 'font-weight': 700 });
    tx(470, 160, '=', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.8) });
    M(510, 130, [[7, 10], [15, 22]], ACC, pop(u, 1.0)); mono(585, 230, 'ops.shape(b) → (2, 2)', { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: fade(u, 1.3) });
    mono(150, 100, 'b = ops.matmul(a, a)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
    [['jnp.matmul', 260], ['tf.matmul', 480], ['torch.matmul', 700]].forEach(([n, x], i) => { grow(585, 250, x, 334, E(u, 1.5 + i * 0.15, 1.9 + i * 0.15), GRID, { plain: true }); mono(x + 82, 330, n, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.9 + i * 0.15) }); });
    note(700, 150, 'NumPy 같은 API 하나', fade(u, 2.2), { fill: ACC }); }

  // ---------- 3. 엔진별 강점과 조합 ----------
  const BK = [['jax', 'XLA 기본 · TPU · 대규모 분산', '대규모 학습'], ['tf', 'Serving · Lite · JS 배포', '프로덕션 배포'], ['torch', '생태계 · 디버깅 편함', '연구 · 실험']];
  function s3(t, c) { const { k, u } = c;
    BK.forEach(([e, s, best], i) => { if (i > k) return; const x = 170 + i * 310, sc = i === k && k < 3 ? pop(u, 0.2) : 1, dim = k >= 3 && e === 'torch';
      card(x, 100, 280, 112, { rx: 12, stroke: dim ? GRID : ENG[e][1], sw: 2.2, s: sc });
      tx(x, 72, ENG[e][0], { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: dim ? OFF : ENG[e][1], opacity: sc });
      tx(x, 104, s, { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(sc, 0.5, 0.4) * (dim ? 0.5 : 1) });
      pill(x, 136, best, dim ? GRID : ENG[e][1], i === k && k < 3 ? pop(u, 0.8) : 1, { fs: 13.5, color: dim ? OFF : null }); });
    if (k < 3) { if (k === 2) note(480, 260, '강점이 겹치지 않는다', fade(u, 1.6), { 'text-anchor': 'middle' }); return; }
    // ① 학습 프로세스 (JAX) → model.keras → ② 배포 프로세스 (TF)
    zone(20, 200, 380, 200, '프로세스 ① 학습', { fill: INFOBG, op: k === 3 ? fade(u, 0.2) : 1 });
    mono(40, 250, 'KERAS_BACKEND = "jax"', { 'font-size': 14, 'font-weight': 700, fill: INFO });
    mono(40, 280, 'model = build_model()', { 'font-size': 14 }); mono(40, 306, 'model.fit(x_train, y_train, epochs=20)', { 'font-size': 13.5 });
    mono(40, 332, 'model.save("model.keras")', { 'font-size': 14, 'font-weight': 700 });
    if (k === 3) { R.check(360, 332, 9, pop(u, 1.4)); return; }
    const d = k === 4 ? E(u, 0.2, 0.9) : 1;
    el('path', { d: 'M440,282 h34 l12,12 v46 h-46 z', fill: PANEL, stroke: ACC, 'stroke-width': 2.2, opacity: d });
    mono(464, 362, 'model.keras', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: d });
    grow(400, 310, 436, 310, d, ACC);
    zone(540, 200, 400, 200, '프로세스 ② 배포 (따로 실행)', { fill: WARNBG, op: k === 4 ? fade(u, 0.6) : 1 });
    const L2 = [['KERAS_BACKEND = "tensorflow"', WARN, 700], ['keras.saving.load_model("model.keras")', INK, 400], ['model.export("serving/")', INK, 700]];
    L2.forEach(([s, col, w], i) => mono(560, 250 + i * 28, s, { 'font-size': 13.5, 'font-weight': w, fill: col, opacity: k === 4 ? fade(u, 0.8 + i * 0.3) : 1 }));
    grow(492, 310, 536, 310, k === 4 ? E(u, 0.7, 1.0) : 1, ACC);
    pill(740, 370, 'SavedModel → TF Serving', WARN, k === 4 ? pop(u, 1.9) : 1, { fs: 13.5, fill: PANEL });
    if (k === 5) { el('path', { d: 'M210,196 Q480,150 740,196', fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 0.3) });
      pill(480, 178, '같은 모델 정의 · 재작성 0', ACC, pop(u, 0.8), { fs: 14, fill: ACCBG }); } }

  // ---------- 4. 두 방식의 이식 ----------
  const COLS = [['tf', 560], ['jax', 700], ['torch', 840]];
  const ROWS = [
    ['방식 1 · fit + 콜백', ['ok', 'ok', 'ok']],
    ['방식 2 · GradientTape 루프', ['ok', 'no', 'no']],
    ['방식 2′ · compute_loss 재정의', ['ok', 'ok', 'ok']],
    ['train_step 직접 재정의', ['split', 'split', 'split']],
  ];
  function mark(x, y, m, s) { if (m === 'ok') check(x, y, 10, s); else if (m === 'no') cross(x, y, 9, s); else if (m === 'q') mono(x, y + 6, '?', { 'font-size': 18, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: s }); else pill(x, y, '엔진별', WARN, s, { fs: 13.5, fill: WARNBG }); }
  function s4(t, c) { const { k, u } = c;
    COLS.forEach(([e, x]) => eng(x, 44, e, { w: 120, h: 34, fs: 14 }));
    const nR = [1, 2, 3, 3, 3, 4, 4][k];
    ROWS.forEach(([name, ms], i) => { if (i >= nR) return; const y = 92 + i * 44, isNew = (k === 0 && i === 0) || (k === 1 && i === 1) || (k === 2 && i === 2) || (k === 5 && i === 3);
      el('rect', { x: 20, y: y - 20, width: 920, height: 40, rx: 6, fill: i === 2 ? ACCBG : SOFT, opacity: isNew ? fade(u, 0.1) : 1 });
      tx(36, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: isNew ? fade(u, 0.2) : 1, fill: i === 2 ? ACC : INK });
      ms.forEach((m, j) => { const pending = i === 2 && k < 4, mm = pending ? (j === 0 ? 'ok' : 'q') : m, s = isNew ? pop(u, 0.6 + j * 0.3) : (i === 2 && k === 4 ? pop(u, 1.6 + j * 0.2) : 1);
        mark(COLS[j][1], y, i === 2 && k === 4 && u < 1.6 + j * 0.2 ? 'q' : mm, s); }); });
    const lowY = 270;
    if (k === 0) { snippet(40, lowY - 20, ['model.fit(x_train, y_train, epochs=5,', '          callbacks=[keras.callbacks.EarlyStopping()])'], { op: fade(u, 1.4) }); note(560, 380, 'fit 은 엔진 위 한 겹 더 얹힌 API', fade(u, 2.0), { fill: GOOD }); return; }
    if (k === 1) { snippet(40, lowY - 20, ['with tf.GradientTape() as tape:', '    ...'], { op: fade(u, 1.2) }); note(560, 300, 'tf.* 는 JAX·PyTorch 백엔드에 없다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 2) { snippet(40, lowY - 20, ['class MyModel(keras.Model):', '    def compute_loss(self, x=None, y=None, y_pred=None,', '                     sample_weight=None, training=True):'], { op: fade(u, 1.2) });
      note(620, 370, '루프는 fit 에 두고 손실만 바꾼다', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 3) { snippet(40, lowY - 20, ['base = super().compute_loss(x, y, y_pred, sample_weight, training)', 'reg = 1e-3 * ops.mean(ops.square(y_pred))   # 내가 더한 항', 'return base + reg'], { op: fade(u, 0.3), fs: 14 });
      note(40, 404, 'tf.* 가 한 번도 나오지 않는다', fade(u, 1.8), { fill: GOOD }); return; }
    if (k === 4) { card(140, 320, 180, 44, { rx: 8, text: 'loss = base + reg', fs: 14, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.2) });
      [['TF: GradientTape', 280], ['JAX: jax.grad', 330], ['torch: autograd', 380]].forEach(([n, y], i) => { grow(232, 320, 556, y, E(u, 0.5 + i * 0.2, 1.0 + i * 0.2), ACC);
        card(650, y, 180, 38, { rx: 6, text: n, fs: 13.5, mono: true, fw: 700, stroke: ENG[COLS[i][0]][1], color: ENG[COLS[i][0]][1], s: pop(u, 0.9 + i * 0.2) }); });
      sub(860, 300, 'fit 의 기본', fade(u, 1.8), { 'font-size': 14 }); sub(860, 322, 'train_step 이', fade(u, 1.8), { 'font-size': 14 }); sub(860, 344, '이미 갖고 있다', fade(u, 1.8), { 'font-size': 14 }); return; }
    if (k === 5) { snippet(40, lowY - 10, ['# TF 백엔드: def train_step(self, data): with tf.GradientTape() ...', '# JAX 백엔드: def train_step(self, state, data): 순수 함수', '# torch 백엔드: def train_step(self, data): loss.backward() ...'], { op: fade(u, 1.0), fs: 13.5 });
      note(40, 404, '기울기 코드를 직접 쓰는 순간 한 벌로 세 엔진은 끝난다', fade(u, 2.0), { fill: WARN }); return; }
    // k6: 로직은 내가, 배선은 Keras 가
    card(480, 280, 600, 50, { rx: 10, text: '로직 — 내가 keras.ops 로 (compute_loss · 지표 · 층)', fs: 15, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) });
    card(480, 350, 600, 50, { rx: 10, text: '배선 — Keras 가 엔진별 자동미분으로', fs: 15, fw: 800, stroke: INK, s: pop(u, 0.8) });
    grow(480, 305, 480, 325, E(u, 1.0, 1.3), MUT); note(480, 410, '같은 커스텀 코드가 세 백엔드에서 돈다', fade(u, 1.8), { 'text-anchor': 'middle', fill: GOOD }); }

  // ---------- 5. 미래 지도 ----------
  const ISL = [['sharding', 'JAX 전용', 'jax', 640, 90], ['tf.data 최적화', 'TF 전용', 'tf', 690, 230], ['torchvision', 'PyTorch 생태계', 'torch', 640, 360]];
  function s5(t, c) { const { k, u } = c;
    const cs = k === 0 ? pop(u, 0.2) : 1;
    el('circle', { cx: 300, cy: 220, r: 170 * cs, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5 });
    tx(300, 82, '중립 영역', { 'font-size': 16, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: cs });
    ['keras', 'keras.ops', 'keras.layers'].forEach((n, i) => pill(300, 118 + i * 36, n, ACC, k === 0 ? pop(u, 0.5 + i * 0.2) : 1, { mono: true, fs: 14, fill: PANEL }));
    ['jax', 'tf', 'torch'].forEach((e, i) => { const y = 120 + i * 100; eng(880, y, e, { w: 120, s: k === 0 ? pop(u, 1.0 + i * 0.2) : 1 });
      if (k === 0) grow(420, 190 + (i - 1) * 20, 816, y, E(u, 1.2 + i * 0.2, 1.7 + i * 0.2), ACC); });
    if (k === 0) { note(300, 410, 'Keras 하나로 세 엔진을 대비한다', fade(u, 2.0), { 'text-anchor': 'middle', fill: ACC }); return; }
    ISL.forEach(([n, d, e, x, y], i) => { const s = k === 1 ? pop(u, 0.3 + i * 0.3) : 1, col = ENG[e][1];
      card(x, y, 170, 52, { rx: 26, stroke: col, fill: PANEL, dash: '6 4', s });
      tx(x, y - 2, n, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, class: 'mono', opacity: s }); sub(x, y + 17, d, s); });
    if (k === 1) { note(300, 410, '여기서는 중립성이 깨진다', fade(u, 1.6), { 'text-anchor': 'middle', fill: WARN }); return; }
    if (k === 2) { card(300, 268, 320, 54, { rx: 8, text: 'model = keras.Sequential(\n    [keras.layers.Dense(10)])', fs: 13.5, mono: true, fw: 700, s: pop(u, 0.3) });
      note(300, 410, '기본은 이 안에서 짠다', fade(u, 1.4), { 'text-anchor': 'middle', fill: ACC }); return; }
    if (k === 3) { el('rect', { x: 470, y: 22, width: 300, height: 120, rx: 10, fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.2) });
      mono(486, 46, 'if keras.backend.backend() == "jax":', { 'font-size': 13.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.4) });
      note(620, 168, '전용 코드는 한 곳에 가둔다', fade(u, 1.6), { 'text-anchor': 'middle', fill: INFO, 'font-size': 14 }); return; }
    if (k === 4) { grow(725, 360, 816, 330, E(u, 0.3, 0.8), GOOD); pill(640, 300, 'nn.Module 과 섞기', GOOD, pop(u, 0.9), { fs: 14, fill: GOODBG });
      note(300, 410, 'PyTorch 를 알면 torch 백엔드를 더 깊이 쓴다', fade(u, 1.6), { 'text-anchor': 'middle', fill: GOOD }); return; }
    grow(500, 398, 660, 398, E(u, 0.3, 0.8), INK); pill(760, 398, 'V-2-2 선택 가이드', INK, pop(u, 0.8), { fs: 14 });
    note(300, 410, '기본은 중립, 필요한 곳만 전용', fade(u, 0.3), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: 'Keras 가 2019년 tf.keras 가 되면서 생긴 제약은 무엇인가?',
      o: ['TF 없이는 쓸 수 없게 됐다', 'Sequential 모델을 못 쓰게 됐다', 'GPU 를 쓸 수 없게 됐다'], a: 0,
      why: 'from tensorflow import keras 처럼 keras 가 tensorflow 아래로 들어가, 엔진을 바꿀 선택지가 사라졌다.' },
    { q: 'KERAS_BACKEND 를 바꿨는데 backend() 가 여전히 tensorflow 라고 나온다. 가장 먼저 볼 것은 무엇인가?',
      o: ['모델 층 수', '환경변수를 import keras 보다 먼저 설정했는지', 'epochs 값'], a: 1,
      why: '백엔드는 import 시점에 굳는다. 환경변수를 먼저 정하고 그다음 import 해야 한다.' },
    { q: '"학습은 JAX, 배포는 TF" 조합에서 두 프로세스를 잇는 것은 무엇인가?',
      o: ['GradientTape 기록', 'TF Serving 의 REST 포트', '백엔드 중립 파일 model.keras'], a: 2,
      why: 'JAX 프로세스가 model.keras 로 저장하고, TF 프로세스가 같은 파일을 열어 export 한다. 모델 정의를 다시 쓰지 않는다.' },
    { q: '세 백엔드에서 그대로 도는 커스텀을 하려면 어디를 재정의하는가?',
      o: ['compute_loss 같은 fit 이 부르는 지점', 'train_step 안의 GradientTape', 'optimizer.apply 에 손실을 직접 넘기기'], a: 0,
      why: '기울기 계산은 fit 의 기본 train_step 이 엔진마다 맡는다. train_step 을 직접 고치면 TF·JAX·PyTorch 코드가 갈린다.' },
    { q: 'Keras 3 의 중립성이 깨지는 곳은 어디인가?',
      o: ['keras.layers 로 층을 쌓을 때', 'sharding·tf.data 최적화 같은 엔진 전용 기능', 'keras.ops.matmul 을 쓸 때'], a: 1,
      why: '엔진 전용 기능과 생태계 라이브러리는 그 엔진에서만 돈다. backend() 분기로 한 곳에 가둬 쓴다.' },
  ];
  const summary = [
    'Keras 는 독립으로 태어나 tf.keras 로 TF 에 묶였다가 Keras 3 에서 다시 독립했다.',
    'KERAS_BACKEND 를 import 전에 정하면 같은 모델 코드가 JAX·TF·PyTorch 위에서 돈다.',
    '저장은 model.keras 로 하므로 학습은 JAX, 배포는 TF 처럼 단계마다 엔진을 바꿀 수 있다.',
    '커스텀은 compute_loss 같은 중립 지점에서 하고, 엔진 전용 코드는 한 곳에 가둔다.',
  ];
  const review = [
    { q: 'TF 백엔드로 짠 GradientTape 학습 루프를 JAX 백엔드에서 돌렸더니 바로 깨졌다. 고칠 방향은?',
      o: ['tf.GradientTape 를 jax 버전으로 import 한다', '손실 로직을 compute_loss 로 옮기고 fit 으로 돌린다', 'KERAS_BACKEND 를 import 뒤로 옮긴다'], a: 1,
      why: 'GradientTape 는 TF 에만 있다. fit 의 기본 train_step 이 엔진별 미분을 맡으니 로직만 keras.ops 로 compute_loss 에 둔다.' },
    { q: 'JAX 로 학습한 모델을 TF Serving 에 올려야 한다. 맞는 순서는?',
      o: ['JAX 프로세스에서 바로 tf.saved_model.save', '모델을 TF 코드로 다시 짠다', 'model.keras 로 저장하고 TF 백엔드 프로세스에서 열어 export'], a: 2,
      why: '.keras 는 엔진 중립 포맷이다. 다른 프로세스에서 TF 백엔드로 열어 export 하면 SavedModel 이 나온다.' },
    { q: '팀 코드 곳곳에 jax 전용 sharding 호출이 흩어져 있다. 먼저 할 일은?',
      o: ['backend() 분기 한 곳으로 모아 격리한다', '모든 층을 tf.keras 로 바꾼다', 'keras.ops 를 전부 지운다'], a: 0,
      why: '전용 기능을 쓰는 것 자체는 괜찮다. 흩어져 있으면 엔진을 바꿀 때 전부 깨지므로 한 곳에 가둔다.' },
  ];

  R.page({ title: 'Keras 3 멀티 백엔드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
