/* V-2-2 졸업 — 실무 선택 가이드 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * choose_framework 호출 결과와 커스텀 학습 스텝은 venv(TF 2.21)에서 다시 돌려 확인했다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, dot, zone, cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));
  // 같은 장면 안에서 가장 최근 값 찾기 (데이터가 일부 beat 에만 있을 때)
  const back = (c, key) => { const i = c.steps.indexOf(c.beat); for (let j = i; j >= 0; j--) if (c.steps[j][key]) return c.steps[j][key]; return null; };

  // ---------- 1. 과정 복습 지도 ----------
  const PARTS = [['Ⅰ', '두 방식의 기원', ['TF1 정적 그래프', 'TF2 eager', 'Keras 흡수'], MUT],
    ['Ⅱ', '방식 1 · 고수준', ['Sequential', 'compile·fit', '콜백'], ACC], ['Ⅲ', '방식 2 · 저수준', ['GradientTape', '커스텀 루프', 'tf.function'], INFO],
    ['Ⅳ', '규모', ['tf.data', 'MirroredStrategy', 'AMP'], WARN], ['Ⅴ', '배포', ['SavedModel', 'TF Serving', 'TFLite·TF.js'], GOOD]];
  function s1(t, c) { const { k, u } = c, n = [1, 2, 3, 3, 5, 5, 5][k], nu = [0, 1, 2, -1, 3, -1, -1][k];
    PARTS.forEach(([p, ti, items, col], i) => { if (i >= n) return; const x = 104 + i * 188, isNew = i >= nu && nu >= 0 && i < n && (k === 4 ? i >= 3 : i === nu), s = isNew ? pop(u, 0.2 + (i - Math.max(nu, 0)) * 0.3) : 1;
      const h = 156 + i * 22, top = 272 - h;
      card(x, top + h / 2, 170, h, { rx: 12, stroke: col, sw: 2.2, s });
      mono(x, top + 32, p, { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: s });
      tx(x, top + 60, ti, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: s });
      items.forEach((it, j) => mono(x, top + 90 + j * 24, it, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: isNew ? fade(u, 0.6 + j * 0.15) : s })); });
    if (k === 3) { card(380, 310, 330, 42, { rx: 8, text: 'HIGH_LEVEL = "model.fit()"', fs: 14.5, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.3) });
      card(380, 362, 330, 42, { rx: 8, text: 'LOW_LEVEL = "tf.GradientTape()"', fs: 14.5, mono: true, fw: 800, stroke: INFO, color: INFO, fill: INFOBG, s: pop(u, 0.8) });
      grow(570, 310, 570, 360, E(u, 1.2, 1.6), MUT); note(720, 340, '필요하면 아래 층으로', fade(u, 1.6), { 'text-anchor': 'middle', fill: MUT }); return; }
    if (k === 5) { [['SCALE', ['tf.data', 'MirroredStrategy', 'mixed_precision'], WARN, 300], ['DEPLOY', ['SavedModel', 'TF-Serving', 'TFLite', 'TF.js'], GOOD, 356]].forEach(([nm, xs, col, y], i) => {
        mono(40, y + 5, nm, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.6) });
        let x = 140; xs.forEach((s, j) => { const w = tw(s, 13.5) + 26; pill(x + w / 2, y, s, col, pop(u, 0.4 + i * 0.6 + j * 0.15), { mono: true, fs: 13.5 }); x += w + 10; }); }); return; }
    if (k === 6) { const F = ['문제 정의', '방식 선택', '규모 확장', '배포 타깃'];
      F.forEach((s, i) => { const x = 150 + i * 220; card(x, 330, 160, 46, { rx: 23, text: s, fs: 15, fw: 800, stroke: ACC, color: ACC, s: pop(u, 0.3 + i * 0.35) });
        if (i > 0) grow(x - 140, 330, x - 84, 330, E(u, 0.3 + i * 0.35, 0.6 + i * 0.35), ACC); });
      note(480, 400, '졸업 = 이 흐름을 상황에 맞게 스스로 고르는 것', fade(u, 2.0), { 'text-anchor': 'middle' }); } }

  // ---------- 2. 방식 다이얼 ----------
  const DX = (p) => 130 + (p / 100) * 700;
  function s2(t, c) { const { k, u } = c, dial = back(c, 'dial'), pd = c.prev ? back({ steps: c.steps, beat: c.prev }, 'dial') : null;
    el('line', { x1: 130, y1: 80, x2: 830, y2: 80, stroke: GRID, 'stroke-width': 8, 'stroke-linecap': 'round' });
    tx(130, 52, '그냥 호출', { 'font-size': 16, 'font-weight': 800, fill: ACC }); sub(130, 112, '문자열 compile·fit', 1, { 'text-anchor': 'start' });
    tx(830, 52, '전부 지정', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'end' }); sub(830, 112, '객체 파라미터·커스텀 루프', 1, { 'text-anchor': 'end' });
    const pn = pd ? pd.positions.length : 0;
    dial.positions.forEach((p, i) => { const isNew = i >= pn, s = isNew ? pop(u, 0.4) : 1, x = DX(p.pct), col = p.pct < 50 ? ACC : INFO;
      el('circle', { cx: x, cy: 80, r: 11 * s, fill: col, stroke: PANEL, 'stroke-width': 3 });
      const up = i % 2 === 1; tx(x, up ? 140 : 140, '', {});
      tx(x, 150 + (i === 3 ? 26 : 0), p.who, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: s }); });
    const LY = 220;
    if (k === 0) { note(480, 260, '스위치가 아니라 얼마나 돌릴지 정하는 다이얼', fade(u, 1.2), { 'text-anchor': 'middle' }); return; }
    if (k === 1 || k === 2) { [['Dense(64, relu)', 380], ['Dense(3, softmax)', 580]].forEach(([n, x], i) => card(x, LY + 40, 180, 46, { rx: 8, text: n, fs: 14.5, mono: true, fw: 700, s: k === 1 ? pop(u, 0.3 + i * 0.3) : 1 }));
      grow(470, LY + 40, 490, LY + 40, 1, MUT); mono(480, LY + 4, 'build_model()', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: k === 1 ? fade(u, 0.2) : 1 });
      grow(400, LY + 64, 220, LY + 130, k === 1 ? E(u, 1.0, 1.5) : 1, ACC); grow(560, LY + 64, 740, LY + 130, k === 1 ? E(u, 1.2, 1.7) : 1, INFO);
      pill(200, LY + 150, 'm1', ACC, k === 2 ? pop(u, 0.3) : (k === 1 ? pop(u, 1.6) : 1), { mono: true, fs: 15 }); pill(760, LY + 150, 'm2', INFO, k === 1 ? pop(u, 1.8) : 1, { mono: true, fs: 15 });
      if (k === 1) sub(480, LY + 175, '차이는 학습 방식뿐', fade(u, 2.0), { 'font-size': 14 });
      if (k === 2) note(300, LY + 156, '← 문자열만 넘길 준비', fade(u, 0.8), { fill: ACC, 'font-size': 14 }); return; }
    if (k === 3) { mono(60, LY, 'm1.compile(', { 'font-size': 15, 'font-weight': 700 });
      ['"adam"', '"sparse_categorical_crossentropy"', '["accuracy"]'].forEach((s, i) => { const w = tw(s, 13.5) + 26; pill([200, 450, 720][i], LY, s, ACC, pop(u, 0.3 + i * 0.25), { mono: true, fs: 13.5 }); });
      card(300, LY + 110, 380, 90, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 1.2) }); mono(300, LY + 86, 'm1.fit(x_train, y_train, epochs=5)', { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.3) });
      const a = E(u, 1.4, 2.6) * Math.PI * 2 * 2; el('circle', { cx: 300, cy: LY + 126, r: 18, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '80 40', transform: `rotate(${a * 57.3} 300 ${LY + 126})`, opacity: fade(u, 1.4) });
      sub(560, LY + 116, '에폭·배치 루프 전체가 이 한 줄', fade(u, 1.8), { 'text-anchor': 'start', 'font-size': 14 }); return; }
    if (k === 4) { card(300, LY + 30, 400, 74, { rx: 10, stroke: INFO, s: pop(u, 0.3) }); mono(300, LY + 20, 'tf.keras.optimizers.Adam(', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      mono(300, LY + 46, 'learning_rate=1e-3)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) });
      card(300, LY + 130, 400, 50, { rx: 10, stroke: INFO, text: 'SparseCategoricalCrossentropy()', fs: 14, mono: true, fw: 700, s: pop(u, 1.1) });
      note(560, LY + 34, '"adam" 문자열이 객체가 되면', fade(u, 1.6), { 'font-size': 14 }); note(560, LY + 58, '안의 값을 내가 정한다', fade(u, 1.8), { 'font-size': 14, fill: INFO }); return; }
    if (k === 5) { // GradientTape 가 기록하고 되감는다
      tx(40, LY - 10, 'with tf.GradientTape() as tape:', { 'font-size': 14.5, 'font-weight': 700, class: 'mono', fill: INFO });
      const OPS = ['x', 'Dense 64', 'Dense 3', 'loss'], rec = E(u, 0.2, 1.3), rw = E(u, 1.5, 2.4);
      el('rect', { x: 60, y: LY + 20, width: 760, height: 50, rx: 8, fill: SOFT, stroke: GRID });
      OPS.forEach((o, i) => { const x = 120 + i * 200, s = clamp(rec * 4 - i);
        card(x, LY + 45, 140, 36, { rx: 6, text: o, fs: 14, mono: true, fw: 700, stroke: INFO, op: s });
        if (i > 0) grow(x - 130, LY + 45, x - 72, LY + 45, clamp(rec * 4 - i + 0.5), INFO); });
      sub(450, LY + 92, '순전파 연산을 테이프에 기록', fade(u, 0.6), { 'font-size': 14 });
      if (u > 1.5) { grow(720, LY + 120, lerp(720, 120, rw), LY + 120, 1, BAD); mono(lerp(720, 120, rw), LY + 145, 'tape.gradient', { 'font-size': 14, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); }
      card(870, LY + 120, 150, 40, { rx: 8, text: 'apply_gradients', fs: 13.5, mono: true, fw: 700, stroke: GOOD, color: GOOD, s: pop(u, 2.4) });
      note(450, LY + 190, '되감으며 기울기 · 로그와 콜백은 직접', fade(u, 2.5), { 'text-anchor': 'middle', fill: WARN, 'font-size': 14 }); return; }
    note(480, LY + 40, '같은 모델, 같은 결과', fade(u, 0.3), { 'text-anchor': 'middle', 'font-size': 18 });
    note(480, LY + 80, '차이는 통제권을 얼마나 가져오느냐뿐', fade(u, 0.8), { 'text-anchor': 'middle', fill: MUT });
    pill(DX(30), LY + 140, '프로덕션: fit 으로 시작, 병목만 tape', ACC, pop(u, 1.4), { fs: 14 }); }

  // ---------- 3. 결정 트리 ----------
  const QS = [['mobile · edge · iot ?', 'TensorFlow (→ TFLite)'], ['browser ?', 'TensorFlow (→ TF.js)'], ['server 이고 team == platform ?', 'TensorFlow (→ TF Serving)'], ['team == research ?', 'PyTorch (신규 구현이 먼저)'], ['legacy_tf1 ?', 'TensorFlow (compat.v1 유지)']];
  const QY = (i) => 62 + i * 62;
  function s3(t, c) { const { k, u } = c, n = Math.min(5, k);
    mono(30, 410, 'choose_framework(deploy_target, team)', { 'font-size': 14, 'font-weight': 700, opacity: k === 0 ? fade(u, 0.2) : 1 });
    if (k === 0) { card(260, 220, 340, 56, { rx: 10, text: 'deploy_target', fs: 18, mono: true, fw: 800, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 0.5) });
      card(640, 220, 220, 44, { rx: 10, text: 'team', fs: 16, mono: true, fw: 700, stroke: GRID, color: MUT, s: pop(u, 1.0) });
      pill(260, 160, '1순위', ACC, pop(u, 1.3), { fs: 14 }); pill(640, 165, '2순위', MUT, pop(u, 1.5), { fs: 14 });
      note(480, 320, '첫 질문은 어디에 배포되는가', fade(u, 1.9), { 'text-anchor': 'middle' }); return; }
    QS.forEach(([q, a], i) => { if (i >= n) return; const isNew = i === n - 1 && k <= 5, s = isNew ? pop(u, 0.2) : 1, y = QY(i), pt = a.startsWith('PyTorch');
      card(220, y, 330, 42, { rx: 8, text: q, fs: 14, mono: true, fw: 700, stroke: INK, s });
      if (i > 0) grow(220, QY(i - 1) + 21, 220, y - 22, isNew ? E(u, 0.1, 0.3) : 1, MUT);
      grow(386, y, 560, y, isNew ? E(u, 0.5, 0.9) : 1, pt ? BAD : WARN); if (!isNew || u > 0.7) tx(470, y - 8, 'yes', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
      card(720, y, 300, 40, { rx: 20, text: a, fs: 14, fw: 700, stroke: pt ? BAD : WARN, color: pt ? BAD : WARN, fill: pt ? BADBG : WARNBG, s: isNew ? pop(u, 0.9) : 1 }); });
    if (k >= 5) { grow(220, QY(4) + 21, 220, 346, k === 5 ? E(u, 1.2, 1.5) : 1, MUT); card(220, 364, 330, 34, { rx: 17, text: '둘 다 가능 — 팀 숙련도로', fs: 14, fw: 700, stroke: GRID, color: MUT, s: k === 5 ? pop(u, 1.5) : 1 }); }
    if (k === 6) { // 두 호출을 흘려 본다
      const p1 = seg(u, 0.2, 1.0), p2 = seg(u, 1.2, 2.4);
      if (p1 > 0) { const x = p1 < 0.5 ? lerp(40, 220, p1 * 2) : lerp(220, 720, (p1 - 0.5) * 2); card(x, QY(0) - 26, 150, 24, { rx: 12, text: '("mobile", "app")', fs: 13.5, mono: true, fw: 700, fill: ACC, stroke: 'none', color: PANEL }); }
      if (p2 > 0) { const route = [[40, QY(0)], [220, QY(0)], [220, QY(1)], [220, QY(2)], [220, QY(3)], [720, QY(3)]]; dot(route, p2 < 1 ? p2 : 0.999, BAD, 8); }
      if (u > 2.4) { check(890, QY(0), 9, 1); check(890, QY(3), 9, pop(u, 2.4)); }
      note(720, 372, '프레임워크는 배포 + 팀의 함수', fade(u, 2.5), { 'text-anchor': 'middle', fill: ACC }); } }

  // ---------- 4. PyTorch ↔ TF 대응 ----------
  const PAIRS = [['optimizer.zero_grad()', '(tape 가 매번 새로 기록)'], ['pred = model(x)', 'with tf.GradientTape() as tape:'], ['loss.backward()', 'tape.gradient(loss, vars)'], ['optimizer.step()', 'opt.apply_gradients(...)']];
  function s4(t, c) { const { k, u } = c, rows = c.beat.bridge.rows, prev = (c.prev && c.prev.bridge) ? c.prev.bridge.rows.map((r) => r.concept) : [];
    tx(200, 40, 'PyTorch', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); tx(760, 40, 'TensorFlow', { 'font-size': 17, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle' });
    const rh = rows.length > 4 ? 40 : 44;
    rows.forEach((r, i) => { const y = 76 + i * rh, isNew = !prev.includes(r.concept), s = isNew ? pop(u, 0.2 + (k === 5 ? (i % 3) * 0.3 : 0)) : 1, hot = (k === 3 || k === 4) && r.concept === '자동미분';
      if (hot) el('rect', { x: 20, y: y - 18, width: 920, height: 36, rx: 8, fill: INFOBG });
      mono(200, y + 5, r.pt, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: s });
      pill(480, y, r.concept, hot ? INFO : INK, s, { fs: 13.5, fill: PANEL });
      mono(760, y + 5, r.tf, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: WARN, opacity: s });
      grow(330, y, 420, y, isNew ? E(u, 0.4, 0.7) : 1, GRID, { plain: true }); grow(630, y, 540, y, isNew ? E(u, 0.4, 0.7) : 1, GRID, { plain: true }); });
    if (k === 3 || k === 4) { const np = k === 3 ? 2 : 4; tx(480, 268, '커스텀 학습 스텝 한 줄씩', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
      PAIRS.slice(0, np).forEach(([a, b], i) => { const y = 300 + i * 30, isNew = k === 4 ? i >= 2 : true, s = isNew ? fade(u, 0.5 + (i % 2) * 0.4) : 1;
        mono(380, y, a, { 'font-size': 13.5, 'text-anchor': 'end', fill: BAD, opacity: s }); mono(580, y, b, { 'font-size': 13.5, fill: WARN, opacity: s });
        grow(392, y - 5, 568, y - 5, isNew ? E(u, 0.6 + (i % 2) * 0.4, 1.0 + (i % 2) * 0.4) : 1, GRID); }); return; }
    if (k >= 5) { const y = 380; card(480, y, 760, 46, { rx: 23, stroke: ACC, fill: ACCBG, s: pop(u, k === 5 ? 1.4 : 0.1) });
      mono(480, y + 5, k === 5 ? 'KERAS_BACKEND = "torch" — 같은 Keras 코드가 그대로 (V-2-1)' : '개념은 하나, 문법만 다르다', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, k === 5 ? 1.6 : 0.3) }); } }

  // ---------- 5. 졸업 ----------
  const NEXT = [['PyTorch 과정', '대응표 덕에 빠르게'], ['딥러닝 이론', '왜 되는지를 파고든다'], ['MLOps', '모델을 파이프라인으로'], ['LLMOps', '거대 모델의 서빙·운영']];
  function s5(t, c) { const { k, u } = c, cl = back(c, 'checklist') || [];
    if (k === 6) { tx(480, 170, '프레임워크는 도구,', { 'font-size': 32, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 0.2, 0.6) });
      tx(480, 222, '문제가 먼저다', { 'font-size': 32, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.9, 0.6) });
      sub(480, 280, '무슨 문제를, 어디에 배포하는가를 먼저 본다', fade(u, 1.6), { 'font-size': 16 }); return; }
    tx(40, 50, '실무 투입 전 손풀기', { 'font-size': 16, 'font-weight': 800 });
    cl.forEach((it, i) => { const y = 100 + i * 70, isNew = i === k && k <= 2, s = isNew ? pop(u, 0.2) : 1, done = k >= 5 ? fade(u, 0.6 + i * 0.4) : 0;
      el('rect', { x: 40, y: y - 16, width: 30, height: 30, rx: 6, fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: s });
      if (done > 0) check(55, y - 1, 10, done);
      tx(86, y + 1, it.task, { 'font-size': 15, 'font-weight': 700, opacity: s }); sub(86, y + 24, it.gain, s, { 'text-anchor': 'start' }); });
    if (k <= 2) { const G = [['fit', 'tape'], ['export', '서빙'], ['생성자 tape', '판별자 tape']][k];
      G.forEach((g, j) => pill(200 + j * 160, 340, g, [ACC, INFO][j], pop(u, 0.8 + j * 0.3), { mono: true, fs: 14 }));
      grow(250 + 0, 340, 300, 340, E(u, 1.2, 1.5), MUT); return; }
    // 다음 경로
    tx(560, 50, '여기서 갈라지는 길', { 'font-size': 16, 'font-weight': 800 });
    const nn = k === 3 ? 2 : 4;
    NEXT.slice(0, nn).forEach(([nm, why], i) => { const y = 100 + i * 74, isNew = (k === 3 && i < 2) || (k === 4 && i >= 2), s = isNew ? pop(u, 0.3 + (i % 2) * 0.4) : 1;
      grow(480, 230, 600, y, isNew ? E(u, 0.2 + (i % 2) * 0.4, 0.6 + (i % 2) * 0.4) : 1, GRID, { plain: true });
      card(760, y, 300, 56, { rx: 12, stroke: ACC, s }); tx(626, y - 2, nm, { 'font-size': 15, 'font-weight': 800, opacity: s }); sub(626, y + 18, why, s, { 'text-anchor': 'start' }); });
    if (k === 5) terminal(40, 330, 440, 80, ['[ ] 같은 모델을 fit 과 GradientTape 로 각각 구현', '[ ] SavedModel 로 export → 서빙까지 최소 1회'], E(u, 0.3, 1.8) * 2, { fs: 13.5 }); }

  const quiz = [
    { q: '복습 지도에서 Part Ⅳ·Ⅴ 가 다룬 것은 무엇인가?',
      o: ['GradientTape 커스텀 루프', '학습 바깥의 규모와 배포', 'TF1 정적 그래프'], a: 1,
      why: 'Ⅳ 는 tf.data·분산·AMP로 규모를, Ⅴ 는 SavedModel·Serving·TFLite·TF.js로 배포를 다뤘다.' },
    { q: '표준 분류 문제로 MVP를 빨리 내야 한다. 다이얼 위치는 어디인가?',
      o: ['극우: 객체 지정과 커스텀 루프', '중간: 콜백과 커스텀 지표', '극좌: 문자열 compile과 fit 한 줄'], a: 2,
      why: '빠른 결과가 곧 시장 검증이다. 표준 문제에 커스텀 루프를 쓰면 버그만 는다.' },
    { q: 'choose_framework("any", "research")의 결과는 무엇인가?',
      o: ['TensorFlow (→ TF Serving)', 'PyTorch (신규 구현이 먼저)', '둘 다 가능 — 팀 숙련도로 결정'], a: 1,
      why: '배포 조건 세 개에 걸리지 않고 team이 research라 PyTorch 분기로 간다. 실제로 돌려도 같은 값이 나온다.' },
    { q: 'PyTorch의 loss.backward()에 대응하는 TF 코드는 무엇인가?',
      o: ['opt.apply_gradients(...)', 'model(x, training=True)', 'tape.gradient(loss, vars)'], a: 2,
      why: 'backward()는 tape.gradient로, optimizer.step()은 apply_gradients로 짝을 이룬다.' },
    { q: '체크리스트 중 학습과 서빙 사이의 간극을 직접 겪게 하는 항목은 무엇인가?',
      o: ['SavedModel로 export 해 서빙까지 1회', '커스텀 루프로 GAN 스케치', '같은 모델을 fit과 tape로 구현'], a: 0,
      why: '학습 노트북에서는 안 보이던 문제가 서빙 앞에서 나온다. 배포까지 한 번 가 봐야 간극이 보인다.' },
  ];
  const summary = [
    'TF는 fit이라는 고수준과 GradientTape라는 저수준, 두 층을 가진 하나의 프레임워크다.',
    '두 방식은 다이얼의 양 끝이다. 표준 문제는 왼쪽에서 시작하고 필요한 곳만 오른쪽으로 돌린다.',
    '프레임워크를 고를 때 첫 질문은 어디에 배포하느냐이고, 그다음이 팀 상황이다.',
    'PyTorch와 TF는 텐서·자동미분·옵티마이저가 짝을 이뤄 문법만 바꾸면 읽힌다.',
  ];
  const review = [
    { q: '사내 추천 모델을 플랫폼 팀이 서버에서 대규모로 서빙해야 한다. choose_framework("server", "platform")의 답은?',
      o: ['PyTorch 쪽 결과', 'TF Serving 쪽 결과', '팀 숙련도로 정하는 기본값'], a: 1,
      why: 'server 이면서 platform인 분기가 research 분기보다 먼저 검사된다. 버전·배칭이 성숙한 TF Serving이 답이다.' },
    { q: 'fit으로 돌던 표준 분류기를 GradientTape 루프로 바꿨더니 로그와 조기종료가 사라졌다. 이유는?',
      o: ['GradientTape가 TF 전용이라서', 'Adam 학습률을 1e-3으로 둬서', '로그·콜백은 fit이 주던 것이라 직접 짜야 해서'], a: 2,
      why: '다이얼을 오른쪽으로 돌리면 통제권과 함께 fit이 하던 일도 넘어온다. 표준 문제면 왼쪽에 머무는 편이 낫다.' },
    { q: 'PyTorch만 써 본 동료가 TF 커스텀 학습 스텝을 읽어야 한다. 가장 빨리 이해시키는 방법은?',
      o: ['backward는 tape.gradient, step은 apply_gradients로 짝지어 보인다', 'TF1 정적 그래프 역사부터 설명한다', 'Keras 3 백엔드를 jax로 바꿔 보인다'], a: 0,
      why: '두 프레임워크는 개념이 짝을 이룬다. 줄마다 대응을 붙여 주면 문법만 갈아끼우면 된다.' },
  ];

  R.page({ title: '졸업 — 실무 선택 가이드', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
