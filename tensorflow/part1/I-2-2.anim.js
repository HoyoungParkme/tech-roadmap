/* I-2-2 PyTorch 와 TensorFlow, 무엇을 고를까 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * venv 로 확인한 것: 두 진영의 MLP(4 → 64 → 3) 파라미터는 둘 다 515 개 (torch 2.x · tensorflow-cpu 2.21)
 *   TFLiteConverter.from_keras_model → convert() 결과 3,280 바이트(이 실행), tf_model.export → SavedModel 폴더
 *   sum(w²) 의 기울기 [2. 4. 6.] 은 GradientTape 로 같은 값 확인 (venv 에 jax·transformers 는 없어 그 줄은 돌리지 못했다)
 * 지형의 기울기는 방향만 그린다. 페이지 옛 데이터의 82 : 18 같은 비율은 출처가 없는 예시라 숫자로 쓰지 않는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, zone,
    cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const PT = INFO, PTBG = INFOBG, TF = ACC, TFBG = ACCBG;   // PyTorch = 파랑, TF = 주제색

  // 시소: tilt -1(왼쪽 PyTorch 쪽으로) ~ +1(오른쪽 TF 쪽으로)
  function seesaw(cx, cy, tilt, title, o) { o = o || {}; const L = 170, a = tilt * 0.2, dx = Math.cos(a) * L, dy = Math.sin(a) * L, op = o.op ?? 1;
    el('polygon', { points: `${cx - 22},${cy + 46} ${cx + 22},${cy + 46} ${cx},${cy + 4}`, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: op });
    el('line', { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy, stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: op });
    card(cx - dx, cy - dy - 22, 120, 36, { rx: 8, text: 'PyTorch', fs: 15, stroke: PT, fill: PTBG, color: PT, op });
    card(cx + dx, cy + dy - 22, 120, 36, { rx: 8, text: 'TensorFlow', fs: 15, stroke: TF, fill: TFBG, color: TF, op });
    if (title) lbl(cx, cy + 74, title, op); return { lx: cx - dx, ly: cy - dy, rx: cx + dx, ry: cy + dy }; }
  // MLP 4 → 64 → 3 (64 는 6 개만 그림)
  function mlp(x0, cy, col, s, o) { o = o || {}; const X = [x0, x0 + 90, x0 + 180], N = [[-36, -12, 12, 36], [-60, -36, -12, 12, 36, 60], [-24, 0, 24]];
    [0, 1].forEach((li) => N[li].forEach((a) => N[li + 1].forEach((b) => el('line', { x1: X[li], y1: cy + a, x2: lerp(X[li], X[li + 1], s), y2: lerp(cy + a, cy + b, s), stroke: OFF, 'stroke-width': 1 }))));
    N.forEach((col2, li) => col2.forEach((y) => el('circle', { cx: X[li], cy: cy + y, r: 8, fill: li === 2 ? col : PANEL, stroke: col, 'stroke-width': 2, opacity: s })));
    [['4', 0], ['64', 1], ['3', 2]].forEach(([t, i]) => mono(X[i], cy + 84, t, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: s })); }
  const dots3 = (x, y, n, col, op) => { for (let i = 0; i < 3; i++) el('circle', { cx: x + i * 16, cy: y, r: 5.5, fill: i < n ? col : 'none', stroke: col, 'stroke-width': 1.8, opacity: op ?? 1 }); };
  function fileIcon(cx, cy, name, col, s, note) { const g = R.G(cx, cy, s ?? 1);
    el('path', { d: 'M-22,-28 H10 L22,-16 V28 H-22 Z', fill: PANEL, stroke: col, 'stroke-width': 2.2 }, g); el('path', { d: 'M10,-28 V-16 H22', fill: 'none', stroke: col, 'stroke-width': 2 }, g);
    tx(0, 48, name, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, class: 'mono' }, g);
    if (note) tx(-34, 8, note, { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT }, g); }

  // =========================================================
  // 1. 지형 — 신모델은 어디서 오나, 배포는 어디가 앞서나
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    const tiltR = k === 0 ? 0 : k === 1 ? -E(u, 0.6, 1.8) : -1;
    if (k < 4) {
      const p = seesaw(480, 200, tiltR, '연구 · 논문 구현체 · 신모델');
      if (k === 0) { tx(480, 72, '"PyTorch 대세" 는 어느 지형의 이야기인가', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
        sub(480, 340, '아직 아무것도 올리지 않았다 · 지형부터 본다', fade(u, 1.0), { 'font-size': 15 }); return; }
      if (k === 1) { ['논문 공식 구현', 'HF 신규 체크포인트', '새 모델 코드'].forEach((s, i) => { const g = E(u, 0.2 + i * 0.4, 0.9 + i * 0.4);
          if (g > 0) card(lerp(200 + i * 260, p.lx + 20 - i * 18, g), lerp(50, p.ly - 60 - i * 30, g), tw(s, 13.5) + 22, 30, { rx: 6, text: s, fs: 13.5, stroke: PT, color: PT, fill: PANEL }); });
        sub(480, 340, '신모델이 먼저 오는 쪽으로 기운다 (기울기는 방향만)', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
      if (k === 2) { pill(220, 60, 'AutoModel.from_pretrained("bert-base-uncased")', PT, pop(u, 0.2), { mono: true, fs: 13.5 });
        grow(220, 78, p.lx, p.ly - 44, E(u, 0.6, 1.2), PT);
        card(760, 70, 260, 60, { rx: 10, stroke: PT, fill: PTBG, s: pop(u, 1.2) });
        mono(760, 66, 'BertModel', { 'font-size': 16, 'font-weight': 800, fill: PT, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); mono(760, 88, 'torch.nn.Module', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
        sub(480, 340, '아무것도 지정하지 않으면 나오는 것이 그 생태계의 기본값', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
      // k3: TF 는 한 겹 더
      pill(250, 52, 'TFAutoModel.from_pretrained(…)', TF, pop(u, 0.2), { mono: true, fs: 13.5 });
      card(640, 52, 200, 38, { rx: 8, text: 'TF 가중치 있나?', fs: 14.5, stroke: WARN, s: pop(u, 0.6) });
      grow(400, 52, 538, 52, E(u, 0.5, 0.9), MUT);
      grow(740, 52, 820, 52, E(u, 1.0, 1.3), WARN); card(870, 52, 100, 38, { rx: 8, text: 'from_pt', fs: 14, mono: true, stroke: WARN, color: WARN, s: pop(u, 1.3) });
      grow(870, 72, p.rx + 20, p.ry - 44, E(u, 1.5, 2.0), WARN, { dash: '5 4' });
      tx(870, 112, '없으면 변환 로드', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      sub(480, 340, '연구 지형에서 TF 는 한 겹을 더 거친다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: 지형 두 개
    seesaw(250, 180, -1, '연구 · 신모델', { op: 1 });
    const tp = E(u, 0.4, 1.6), p = seesaw(710, 180, tp, '프로덕션 · 모바일/브라우저/엣지', { op: fade(u, 0.2) });
    ['TFLite', 'TF.js', 'TF Serving'].forEach((s, i) => { const g = E(u, 0.5 + i * 0.3, 1.2 + i * 0.3); card(lerp(860, p.rx + 8, g), lerp(40, p.ry - 62 - i * 30, g), tw(s, 13.5) + 22, 28, { rx: 6, text: s, fs: 13.5, stroke: TF, color: TF, fill: PANEL, op: g > 0 ? 1 : 0 }); });
    card(480, 360, 640, 56, { rx: 12, stroke: GRID, s: pop(u, 2.0) });
    tx(480, 366, '지형은 둘 · 무엇을 만들고 어디에 올리느냐가 먼저다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  // =========================================================
  // 2. 같은 MLP, 두 스타일
  // =========================================================
  const RING = ['zero_grad', 'forward', 'backward', 'step'];
  function ring(cx, cy, r, t, op, s) { el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3, opacity: op });
    RING.forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; card(cx + Math.cos(a) * r, cy + Math.sin(a) * r, tw(n, 13.5) + 20, 30, { rx: 15, text: n, fs: 13.5, mono: true, stroke: PT, color: PT, fill: PANEL, op, s: s ? s(i) : 1 }); });
    const a = -Math.PI / 2 + ((t * 1.3) % 1) * 2 * Math.PI; el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 6, fill: PT, opacity: op }); }
  function s2(t, c) { const { k, u } = c;
    zone(20, 20, 450, 380, 'PyTorch', { color: PT, fill: PTBG });
    zone(490, 20, 450, 380, 'TF · Keras', { color: TF, fill: k >= 3 ? TFBG : 'none', stroke: k >= 3 ? 'none' : GRID, dash: k >= 3 ? null : '6 5', op: k >= 3 ? 1 : 0.6 });
    if (k <= 2) { mlp(60, 140, PT, k === 0 ? E(u, 0.2, 1.2) : 1); mono(150, 66, 'nn.Sequential(…)', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 }); }
    if (k === 0) { mono(360, 150, '515', { 'font-size': 26, 'font-weight': 800, fill: PT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); tx(360, 176, '파라미터', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(245, 300, '은닉 64 짜리 MLP · 두 진영이 공유할 구조', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 1 || k === 2) {
      card(140, 300, 200, 44, { rx: 10, text: 'opt = Adam(…)', fs: 14, mono: true, stroke: PT, s: k === 1 ? pop(u, 0.3) : 1 });
      card(350, 300, 200, 44, { rx: 10, text: 'CrossEntropyLoss()', fs: 13.5, mono: true, stroke: PT, s: k === 1 ? pop(u, 0.6) : 1 });
      if (k === 1) { tx(245, 362, '부품이 변수로 손에 쥐어진다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.3) }); return; }
      ring(370, 150, 74, t, fade(u, 0.2), (i) => pop(u, 0.3 + i * 0.25));
      tx(245, 362, '네 동작이 매 반복 눈앞에 있다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); return; }
    // 오른쪽 TF
    if (k >= 3) { mlp(530, 140, TF, k === 3 ? E(u, 0.2, 1.2) : 1); mono(620, 66, 'tf.keras.Sequential([…])', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: k === 3 ? fade(u, 0.2) : 1 });
      mlp(60, 140, PT, 1); ring(370, 150, 74, t, k === 4 ? 1 - 0.7 * E(u, 0.5, 1.6) : 1); }
    if (k === 3) { mono(830, 150, '515', { 'font-size': 26, 'font-weight': 800, fill: TF, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); tx(830, 176, '같은 수', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      tx(715, 300, '구조는 한 글자도 다르지 않다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
    if (k === 4) { const g = E(u, 0.5, 1.6);
      fly(370, 150, 715, 300, seg(u, 0.5, 1.6), '루프 전체', { fill: PT });
      card(715, 300, 300, 64, { rx: 12, stroke: TF, fill: PANEL, sw: 2.5, s: pop(u, 1.5) });
      mono(715, 306, 'fit(x, y, epochs=5)', { 'font-size': 17, 'font-weight': 800, fill: TF, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(715, 252, 'compile(adam, sparse_categorical_…)', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.3) });
      tx(715, 372, 'for 루프가 한 줄 안으로 들어갔다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k5
    [[245, PT, '루프가 보인다', '연구자 · 논문 재현 · 비표준 루프'], [715, TF, 'fit 이 대신 돈다', '초심자 · 표준 지도학습 · 빠른 결과']].forEach(([x, col, a, b], i) => {
      card(x, 300, 380, 70, { rx: 12, stroke: col, fill: PANEL, s: pop(u, 0.2 + i * 0.4) });
      tx(x, 294, a, { 'font-size': 16, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.4) }); tx(x, 318, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.4 + i * 0.4) }); });
    card(715, 372, 300, 34, { rx: 17, text: 'TF 도 GradientTape 로 내려간다', fs: 14, stroke: TF, color: TF, fill: TFBG, s: pop(u, 1.4) }); }

  // =========================================================
  // 3. 배포 표면 — 목적지가 경로를 정한다
  // =========================================================
  function s3(t, c) { const { k, u } = c, D = c.beat.deploy || [], P = (c.prev && c.prev.deploy) || [];
    const x0 = 40, y0 = 104, rh = 54;
    tx(x0, 72, '목적지', { 'font-size': 14, 'font-weight': 700, fill: MUT }); tx(380, 72, 'TensorFlow', { 'font-size': 15, 'font-weight': 800, fill: TF }); tx(640, 72, 'PyTorch', { 'font-size': 15, 'font-weight': 800, fill: PT });
    D.forEach((d, i) => { const y = y0 + i * rh, old = P.find((q) => q.target === d.target), fresh = !old, op = fresh ? fade(u, 0.2 + i * 0.1) : 1;
      const changed = old && (old.tf.path !== d.tf.path || old.winner !== d.winner);
      el('rect', { x: x0 - 10, y: y - 6, width: 880, height: rh - 8, rx: 8, fill: changed || fresh ? WARNBG : SOFT, opacity: op });
      tx(x0, y + 26, d.target.replace(/^\S+\s/, ''), { 'font-size': 15, 'font-weight': 700, opacity: op });
      const tfn = Math.round(old && !fresh ? tween(old.tf.maturity, d.tf.maturity, u) : d.tf.maturity), ptn = d.torch.maturity;
      tx(380, 26 + y, d.tf.path, { 'font-size': 14.5, 'font-weight': d.winner === 'tf' ? 800 : 500, fill: d.tf.path === '미확인' ? OFF : d.winner === 'tf' ? TF : INK, class: 'mono', opacity: op });
      dots3(560, y + 20, tfn, TF, op);
      tx(640, 26 + y, d.torch.path, { 'font-size': 14.5, 'font-weight': d.winner === 'torch' ? 800 : 500, fill: d.winner === 'torch' ? PT : INK, class: 'mono', opacity: op });
      dots3(860, y + 20, ptn, PT, op); });
    const file = [['model.onnx', PT, null], null, ['TFLiteConverter', TF, null], ['model.tflite', TF, '3,280 바이트 (이 실행)'], ['serving_model/', TF, 'SavedModel'], null][k];
    if (file) fileIcon(880, 356, file[0], file[1], pop(u, 1.4), file[2]);
    const msg = ['ONNX · 어느 런타임에도 얹는 교환 포맷', '여기까지만 보면 PyTorch 로 다 되는 듯하다', '학습한 Keras 모델을 그대로 넘긴다', '앱에 넣어 오프라인으로 추론한다', 'TF.js 는 브라우저, SavedModel 은 TF Serving', '목적지가 정해지면 경로와 성숙도가 따라온다'][k];
    tx(x0, 396, msg, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
    tx(940, 50, '● 성숙도 (페이지의 판단)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }

  // =========================================================
  // 4. 생태계 — 경계가 흐려진다
  // =========================================================
  const BK = [['JAX', 200, 330, WARN], ['TensorFlow', 480, 330, TF], ['PyTorch', 760, 330, PT]];
  function s4(t, c) { const { k, u } = c;
    const blur = k === 4 ? E(u, 0.3, 1.6) : 0;
    if (k < 4) { el('line', { x1: 340, y1: 290, x2: 340, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); el('line', { x1: 620, y1: 290, x2: 620, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5' }); }
    else { [340, 620].forEach((x) => el('line', { x1: x, y1: 290, x2: x, y2: 380, stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 1 - blur })); }
    BK.forEach(([n, x, y, col], i) => card(x, y, 150, 50, { rx: 10, text: n, fs: 16, stroke: col, fill: PANEL, color: col, s: k === 0 ? pop(u, 0.2 + i * 0.1) : 1 }));
    // Keras 3 허브
    const kx = 480, ky = 170;
    if (k === 0) pill(480, 50, 'os.environ["KERAS_BACKEND"] = "jax"', WARN, pop(u, 0.4), { mono: true, fs: 14 });
    card(kx, ky, 160, 56, { rx: 12, text: 'Keras 3', fs: 18, stroke: INK, fill: SOFT, s: k === 0 ? pop(u, 0.8) : 1 });
    const links = k === 0 ? [[0, E(u, 1.2, 1.8)]] : [[0, 1], [1, k === 1 ? E(u, 0.3, 0.9) : 1], [2, k === 1 ? E(u, 0.6, 1.2) : 1]];
    links.forEach(([i, g]) => grow(kx, ky + 28, BK[i][1], BK[i][2] - 26, g, BK[i][3]));
    if (k === 0) { sub(480, 410, 'import keras 보다 먼저 환경변수를 정해야 한다', fade(u, 2.0), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { mono(kx, 100, 'keras.Sequential([Dense(64), Dense(3)])', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      sub(480, 410, '모델 코드는 그대로 · 백엔드만 갈아끼운다', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // HF 노드
    const hx = 800, hy = 120;
    card(hx, hy, 190, 56, { rx: 12, text: 'HuggingFace', fs: 16, stroke: PT, fill: PTBG, color: PT, s: k === 2 ? pop(u, 0.2) : 1 });
    if (k >= 2) { grow(hx, hy + 28, BK[2][1], BK[2][2] - 26, k === 2 ? E(u, 0.5, 1.0) : 1, PT); grow(hx - 60, hy + 28, BK[1][1] + 40, BK[1][2] - 26, k === 2 ? E(u, 0.9, 1.4) : 1, MUT, { dash: '5 4' }); }
    if (k === 2) { mono(BK[2][1] + 50, 240, 'AutoModel (기본)', { 'font-size': 13.5, fill: PT, 'font-weight': 700, opacity: fade(u, 1.0) }); mono(640, 214, 'TFAutoModel', { 'font-size': 13.5, 'text-anchor': 'end', fill: MUT, opacity: fade(u, 1.4) });
      sub(480, 410, '양쪽 지원 · 기본값이 PyTorch 라 신모델 접근성이 갈린다', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    // JAX 노드
    const jx = 110, jy = 110;
    card(jx, jy, 180, 56, { rx: 12, text: 'jax.grad', fs: 16, mono: true, stroke: WARN, fill: WARNBG, color: WARN, s: k === 3 ? pop(u, 0.2) : 1 });
    grow(jx, jy + 28, BK[0][1], BK[0][2] - 26, k === 3 ? E(u, 0.4, 0.9) : 1, WARN);
    if (k === 3) { mono(175, 176, 'f(w) = sum(w²)', { 'font-size': 13.5, opacity: fade(u, 0.8) });
      mono(175, 202, 'grad_fn([1., 2., 3.])', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.1) }); mono(175, 228, '→ [2. 4. 6.]', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.3) });
      sub(480, 410, '기울기를 주는 함수를 돌려준다 · XLA · TPU · Keras 3 의 백엔드', fade(u, 1.9), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); return; }
    card(480, 410 - 4, 560, 30, { rx: 15, text: '변환·공유 레이어가 이어 줄수록 하나를 깊게 아는 값이 커진다', fs: 14.5, stroke: GOOD, color: GOOD, fill: GOODBG, s: pop(u, 1.6) }); }

  // =========================================================
  // 5. 선택 플로차트
  // =========================================================
  const Q = [['팀이 이미 쓰는 스택이 있나', '기존 스택', INK], ['android · ios · browser · edge 배포?', 'TensorFlow', TF], ['목표가 논문 재현·실험?', 'PyTorch', PT]];
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) { const n = k + 1;
      Q.slice(0, Math.min(3, n)).forEach(([q, a, col], i) => { const y = 64 + i * 92, fresh = i === k, s = fresh ? pop(u, 0.2) : 1;
        const g = R.G(250, y, s); el('polygon', { points: '-190,0 0,-32 190,0 0,32', fill: PANEL, stroke: INK, 'stroke-width': 2 }, g);
        tx(0, 5, q, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }, g);
        grow(440, y, 600, y, fresh ? E(u, 0.6, 1.1) : 1, col); tx(520, y - 8, '예', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fresh ? fade(u, 0.8) : 1 });
        card(720, y, 220, 48, { rx: 24, text: a, fs: 16, fill: col, stroke: 'none', color: PANEL, s: fresh ? pop(u, 1.1) : 1 });
        if (i < 2 && (n > i + 1)) { grow(250, y + 32, 250, y + 60, 1, MUT); tx(266, y + 52, '아니오', { 'font-size': 13.5, fill: MUT }); } });
      const why = ['협업·유지보수 비용이 취향보다 크다', 'TFLite·TF.js 의 성숙한 온디바이스 경로', 'HF 신모델·공식 구현체가 PyTorch 기본'];
      if (k < 3) tx(720, 64 + k * 92 + 44, why[k], { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.5) });
      if (k === 3) { grow(250, 64 + 2 * 92 + 32, 250, 336, E(u, 0.2, 0.6), MUT); tx(266, 330, '아니오', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
        card(250, 370, 300, 48, { rx: 24, text: '둘 중 하나 · 깊게', fs: 16, fill: GOOD, stroke: 'none', color: PANEL, s: pop(u, 0.7) });
        tx(640, 370, '고를 근거가 없으면 무엇을 골라도 된다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4) }); }
      return; }
    // k4: 공통 골격과 껍데기
    const bones = ['자동미분', '옵티마이저', '손실', '학습 루프'];
    tx(480, 56, '골격은 같고 문법의 껍데기만 다르다', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.1) });
    const pt = ['loss.backward()', 'torch.optim.Adam', 'nn.CrossEntropyLoss', 'for xb, yb in loader'], tfw = ['tape.gradient', 'keras.optimizers.Adam', 'keras.losses…', 'model.fit / 직접 루프'];
    bones.forEach((b, i) => { const x = 140 + i * 227;
      card(x, 210, 180, 60, { rx: 12, text: b, fs: 17, stroke: INK, fill: SOFT, sw: 2.5, s: pop(u, 0.3 + i * 0.2) });
      mono(x, 140, pt[i], { 'font-size': 13.5, fill: PT, 'text-anchor': 'middle', opacity: fade(u, 1.0 + i * 0.15) }); grow(x, 150, x, 176, E(u, 1.0 + i * 0.15, 1.3 + i * 0.15), PT, { plain: true });
      mono(x, 286, tfw[i], { 'font-size': 13.5, fill: TF, 'text-anchor': 'middle', opacity: fade(u, 1.2 + i * 0.15) }); grow(x, 268, x, 248, E(u, 1.2 + i * 0.15, 1.5 + i * 0.15), TF, { plain: true }); });
    tx(480, 360, '이 과정은 그 골격을 TF 의 두 축 fit · GradientTape 로 익힌다', { 'font-size': 15.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); }

  const quiz = [
    { q: '"요즘은 PyTorch가 대세" 라는 말이 가장 잘 들어맞는 영역은 무엇인가?',
      o: ['안드로이드 앱 온디바이스 추론', '새 논문 구현체와 HuggingFace 신모델', '브라우저 안 추론'], a: 1,
      why: '신모델과 공식 구현체는 PyTorch로 먼저 나온다. 모바일·브라우저·서빙 같은 배포 표면은 TF 계열이 앞선 구간이 많다.' },
    { q: '같은 은닉 64 MLP를 PyTorch와 Keras로 짰을 때 가장 크게 다른 것은 무엇인가?',
      o: ['학습 루프를 손으로 쓰느냐, fit()이 대신 돌리느냐', '파라미터 개수', '층의 구조'], a: 0,
      why: '구조와 파라미터 515 개는 같다. PyTorch는 zero_grad·forward·backward·step을 직접 쓰고 Keras는 fit 한 줄이 그 루프를 돈다.' },
    { q: '안드로이드 앱에 모델을 넣어 오프라인으로 추론해야 한다. 이 장의 기준으로 가장 마찰이 적은 경로는?',
      o: ['torch.onnx.export 후 서버 서빙', 'tf_model.export로 TF Serving', 'TFLiteConverter로 .tflite를 만들어 앱에 넣기'], a: 2,
      why: 'TFLite는 Keras 모델을 그대로 받아 .tflite 파일 하나로 굽는다. 앱에 임베드하는 1급 경로라 실무 시간을 아낀다.' },
    { q: 'Keras 3에서 백엔드를 JAX로 바꾸려면 무엇을 하나?',
      o: ['모델 코드를 JAX 문법으로 다시 쓴다', 'import keras 전에 KERAS_BACKEND 환경변수를 정한다', 'TFAutoModel을 쓴다'], a: 1,
      why: '같은 Keras 코드가 JAX·TensorFlow·PyTorch 위에서 돈다. 환경변수는 keras를 불러오기 전에 정해야 한다.' },
    { q: '팀이 이미 PyTorch로 서비스를 운영 중인데 새 기능이 브라우저 추론이다. 이 장의 플로차트대로라면 먼저 따를 기준은?',
      o: ['팀 스택', '배포 목적지', '연구 여부'], a: 0,
      why: '플로차트의 첫 분기가 팀 스택이다. 협업과 유지보수 비용이 프레임워크 취향보다 크기 때문이다.' },
  ];

  const summary = [
    '신모델과 논문 구현체는 PyTorch로 먼저 오지만 모바일·브라우저 배포는 TF 경로가 성숙하다.',
    '같은 MLP 라도 PyTorch는 학습 루프를 손으로 쓰고 Keras는 fit 한 줄이 그 루프를 돈다.',
    '어디에 올릴지가 정해지면 TFLite, TF.js, ONNX 같은 내보내기 경로와 그 성숙도가 따라온다.',
    'HuggingFace, Keras 3, JAX가 진영을 잇고 있어서 한쪽을 깊게 배우면 다른 쪽도 금방 익힌다.',
  ];
  const review = [
    { q: '최신 논문의 모델을 받아 실험해 보려는데 공식 코드가 PyTorch 뿐이고 TF 가중치는 없다. TF로 쓰려면 무엇이 더 붙나?',
      o: ['from_pt=True 같은 변환 로드를 한 겹 더 거친다', 'TFLite로 먼저 바꿔야 한다', 'Keras 3 백엔드를 torch로 바꾸면 끝난다'], a: 0,
      why: 'TFAutoModel은 TF 가중치가 없으면 PyTorch 가중치를 변환해 불러온다. 연구 지형에서 TF가 한 겹 더 요구하는 지점이다.' },
    { q: 'Keras로 학습한 분류 모델을 웹 페이지 안에서 바로 돌리고 싶다. 어울리는 경로는?',
      o: ['torch.onnx.export', 'TF.js로 변환해 브라우저에서 추론', 'TorchServe 서버에 올린다'], a: 1,
      why: '브라우저 목적지에서는 tensorflowjs_converter로 만든 TF.js 모델이 성숙한 경로다. ONNX Runtime Web도 있지만 이 장에서는 TF 쪽을 앞선 것으로 본다.' },
    { q: '혼자 공부하는 학생이 "PyTorch와 TF 중 무엇을 먼저?" 라고 묻는다. 팀도 배포 목표도 없다. 이 장의 답은?',
      o: ['무조건 PyTorch, 대세라서', '무조건 TF, 배포가 강해서', '아무 쪽이나 하나를 골라 끝까지 깊게 판다'], a: 2,
      why: '자동미분, 옵티마이저, 손실, 학습 루프라는 골격은 같다. 근거가 없을 땐 하나를 깊게 아는 것이 다른 쪽 이주 비용을 가장 많이 낮춘다.' },
  ];

  R.page({ title: '두 진영 고르기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
