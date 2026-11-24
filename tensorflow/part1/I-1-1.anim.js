/* I-1-1 TensorFlow 의 역사 — TF1 정적 그래프 · Keras · TF2 · 두 방식 · 학습 지도. 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 숫자는 venv(tensorflow-cpu 2.21)로 코드 블록을 다시 돌려 확인했다:
 *   TF1 print(c) → Tensor("add:0", dtype=float32), sess.run → 5.0 / TF2 print(c) → tf.Tensor(5.0, shape=(), dtype=float32)
 *   tf.Session → AttributeError / Sequential(Dense 64 relu, Dense 3 softmax), 입력 4 → 파라미터 320 + 195 = 515 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cells, zone,
    cross, check, terminal, server, person, spans } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // ---------- 공통 부품 ----------
  // 그래프 노드: 원 + 글자. o.ph 면 점선(placeholder), o.val 이면 아래에 값 칩
  function node(cx, cy, r, s, o) { o = o || {}; const g = R.G(cx, cy, o.s ?? 1, o.op);
    el('circle', { cx: 0, cy: 0, r, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2.4, 'stroke-dasharray': o.ph ? '5 4' : null }, g);
    tx(0, (o.fs || 17) * 0.36, s, { 'text-anchor': 'middle', 'font-size': o.fs || 17, 'font-weight': 800, fill: o.color || INK, class: o.mono ? 'mono' : null }, g); return g; }
  // 켜고 끄는 스위치: on 0 → 1
  function toggle(cx, cy, on, label) { const w = 112, h = 50, kx = lerp(-w / 2 + h / 2, w / 2 - h / 2, on), col = on > 0.5 ? ACC : MUT;
    el('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: h / 2, fill: on > 0.5 ? ACCBG : SOFT, stroke: col, 'stroke-width': 2.5 });
    el('circle', { cx: cx + kx, cy, r: h / 2 - 6, fill: col });
    mono(cx + (on > 0.5 ? -24 : 24), cy + 5, on > 0.5 ? 'ON' : 'OFF', { 'font-size': 15, 'font-weight': 800, fill: col, 'text-anchor': 'middle' });
    if (label) lbl(cx, cy - h / 2 - 14, label); }
  // 줄 머리에 ✓/✗ 를 단 한 줄
  function mark(x, y, s, ok, op, a) { if (op <= 0) return; (ok ? check : cross)(x, y - 5, 7, op); tx(x + 18, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, opacity: op }, a || {})); }

  // =========================================================
  // 1. TF1 — 선언하고, Session 으로 실행한다
  // =========================================================
  const A1 = [110, 110], B1 = [110, 232], C1 = [330, 171];         // 선언 쪽 그래프
  const A2 = [600, 118], B2 = [600, 224], C2 = [812, 171];         // Session 안 그래프
  function graph1(o) { o = o || {}; const sh = o.sh || (() => 1), op = o.op ?? 1;
    [A1, B1].forEach((p, i) => { const s = sh(0); if (s <= 0) return; node(p[0], p[1], 30, i ? 'b' : 'a', { ph: true, s, op }); });
    if (sh(0) > 0.5) { sub(A1[0], A1[1] + 50, 'placeholder · 값 없음', op * fade(sh(0), 0.5), { 'font-size': 13.5 }); sub(B1[0], B1[1] + 50, 'placeholder · 값 없음', op * fade(sh(0), 0.5), { 'font-size': 13.5 }); }
    if (sh(1) > 0) { grow(A1[0] + 30, A1[1] + 12, C1[0] - 30, C1[1] - 12, sh(1), MUT); grow(B1[0] + 30, B1[1] - 12, C1[0] - 30, C1[1] + 12, sh(1), MUT); }
    if (sh(2) > 0) { node(C1[0], C1[1], 32, '+', { s: sh(2), op, fs: 24 }); sub(C1[0], C1[1] + 54, 'c = add 노드', op * fade(sh(2), 0.4), { 'font-size': 14, fill: INK, 'font-weight': 700 }); } }
  function graph2(o) { o = o || {}; const op = o.op ?? 1, full = o.full;
    [A2, B2].forEach((p, i) => node(p[0], p[1], 24, full ? (i ? '3.0' : '2.0') : (i ? 'b' : 'a'), { ph: !full, op, fs: full ? 15 : 16, mono: full, stroke: full ? ACC : INK, color: full ? ACC : INK }));
    grow(A2[0] + 24, A2[1] + 10, C2[0] - 26, C2[1] - 10, op > 0 ? 1 : 0, MUT); grow(B2[0] + 24, B2[1] - 10, C2[0] - 26, C2[1] + 10, op > 0 ? 1 : 0, MUT);
    node(C2[0], C2[1], 28, o.res || '+', { op, fs: o.res ? 17 : 22, mono: !!o.res, fill: o.res ? GOODBG : PANEL, stroke: o.res ? GOOD : INK, color: o.res ? GOOD : INK }); }
  function frame1(k, u, o) { o = o || {};
    zone(24, 20, 444, 270, '1단계 · 그래프 선언', { op: k === 1 ? fade(u, 0.1) : 1 });
    if (o.right) { zone(508, 20, 428, 270, '2단계 · Session 실행', { op: o.right }); }
    if (o.wall) { const h = 270 * o.wall; el('rect', { x: 481, y: 20, width: 14, height: h, rx: 3, fill: INK }); if (o.wall > 0.95) tx(488, 312, '벽', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800 }); }
    pill(880, 398, 'eager OFF', MUT, 1, { mono: true, fs: 13.5 }); }
  const T1 = ['>>> print(c)', ['Tensor("add:0", dtype=float32)', 'var(--warn)'], '>>> sess.run(c, feed_dict={a: 2.0, b: 3.0})', ['5.0', 'var(--good)']];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) {
      pill(480, 64, 'import tensorflow.compat.v1 as tf', INK, pop(u, 0.2), { mono: true, fs: 15 });
      toggle(480, 178, 1 - E(u, 1.0, 1.7), 'eager 즉시 실행');
      pill(480, 268, 'tf.disable_eager_execution()', ACC, pop(u, 0.8), { mono: true, fs: 15 });
      sub(480, 330, 'TF2 위에서 2015년 TF1 의 동작을 재현하는 준비', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 360, '스위치를 꺼야 선언과 실행이 갈라진 옛 모습이 보인다', fade(u, 2.2), { 'font-size': 14 }); return; }
    if (k <= 3) { frame1(k, u);
      graph1({ sh: (i) => [k === 1 ? pop(u, 0.3) : 1, k === 2 ? E(u, 0.2, 0.9) : k > 2 ? 1 : 0, k === 2 ? pop(u, 0.9) : k > 2 ? 1 : 0][i] });
      if (k === 1) { tx(250, 110, '"값이 들어올 자리"', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.2) }); tx(250, 134, '계산은 아직 없다', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) }); }
      if (k === 2) { tx(330, 98, '덧셈은 일어나지 않았다', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.6) }); }
      if (k === 3) { pill(C1[0], C1[1] - 58, 'add:0', INK, pop(u, 0.2), { mono: true, fs: 14 });
        terminal(24, 306, 444, 102, T1, lerp(0, 2, E(u, 0.3, 1.6)), { title: 'python' });
        card(690, 160, 260, 120, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 1.6) });
        mono(690, 150, 'c 의 값 5 ?', { 'font-size': 20, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
        tx(690, 184, 'print 로도 pdb 로도 못 본다', { 'font-size': 14.5, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
        if (u > 1.7) cross(586, 150, 9, pop(u, 1.7)); }
      return; }
    if (k === 4 || k === 5) { const w = k === 4 ? E(u, 0.2, 0.9) : 1;
      frame1(k, u, { wall: w, right: k === 4 ? fade(u, 0.5) : 1 });
      graph1({ op: 0.45 });
      card(718, 171, 380, 196, { rx: 14, fill: 'none', stroke: ACC, sw: 2.5, dash: '7 5', op: k === 4 ? fade(u, 0.7) : 1 });
      pill(718, 66, 'sess = tf.Session()', ACC, k === 4 ? pop(u, 0.8) : 1, { mono: true, fs: 14, fill: PANEL });
      if (k === 4) { fly(C1[0], C1[1], 718, 171, seg(u, 1.1, 2.0), '그래프', { fill: INK });
        if (u > 2.0) graph2({ op: fade(u, 2.0) });
        terminal(24, 306, 444, 102, T1.slice(0, 2), 2, { title: 'python' });
        sub(718, 330, '실행 엔진이 그래프를 넘겨받는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      // k5: feed_dict 로 값 흘려보내기
      const fd = [640, 336];
      pill(fd[0], fd[1], 'feed_dict = {a: 2.0, b: 3.0}', INFO, pop(u, 0.15), { mono: true, fs: 14 });
      fly(fd[0] - 60, fd[1], A2[0], A2[1], seg(u, 0.4, 1.1), '2.0', { mono: true, fill: INFO });
      fly(fd[0] + 20, fd[1], B2[0], B2[1], seg(u, 0.55, 1.2), '3.0', { mono: true, fill: INFO });
      const filled = u > 1.2;
      graph2({ full: filled, res: u > 2.0 ? '5.0' : null });
      if (filled) { dot([[A2[0] + 24, A2[1] + 10], [C2[0] - 26, C2[1] - 10]], seg(u, 1.25, 1.95), ACC, 6); dot([[B2[0] + 24, B2[1] - 10], [C2[0] - 26, C2[1] + 10]], seg(u, 1.25, 1.95), ACC, 6); }
      terminal(24, 306, 444, 102, T1, 2 + lerp(0, 2, E(u, 0.3, 2.2)), { title: 'python', fs: 13.5 });
      if (u > 2.2) check(C2[0] + 48, C2[1] - 30, 10, pop(u, 2.2)); return; }
    // k6: 왜 이렇게 만들었나
    node(420, 70, 20, 'a', { fs: 14 }); node(420, 140, 20, 'b', { fs: 14 }); node(540, 105, 22, '+', { fs: 18 });
    grow(440, 76, 518, 98, 1, MUT); grow(440, 134, 518, 112, 1, MUT);
    tx(480, 190, '그래프를 통째로 미리 안다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
    grow(420, 205, 250, 240, E(u, 0.4, 0.9), GOOD, { plain: true }); grow(540, 205, 710, 240, E(u, 0.4, 0.9), BAD, { plain: true });
    card(240, 316, 380, 140, { rx: 12, stroke: GOOD, fill: GOODBG, s: pop(u, 0.8) });
    tx(240, 272, '기계에게 유리', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.9) });
    mark(100, 310, '분산 배치를 미리 계획한다', true, fade(u, 1.0)); mark(100, 344, '연산을 묶어 최적화한다 (융합)', true, fade(u, 1.2));
    card(720, 316, 400, 140, { rx: 12, stroke: BAD, fill: BADBG, s: pop(u, 1.4) });
    tx(720, 272, '사람에게 불편', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
    mark(560, 306, 'print 로 값을 볼 수 없다', false, fade(u, 1.6)); mark(560, 336, 'pdb 로 중간값을 못 본다', false, fade(u, 1.8));
    mark(560, 366, 'if/for 대신 tf.cond · tf.while_loop', false, fade(u, 2.0), { 'font-size': 14.5 }); }

  // =========================================================
  // 2. Keras — 쌓고, compile, fit
  // =========================================================
  const NX = [96, 250, 404], NY = 182;
  const NODES = [[-51, -17, 17, 51], [-105, -75, -45, -15, 15, 45, 75, 105], [-34, 0, 34]];
  function net(sh, o) { o = o || {}; const op = o.op ?? 1;
    // 연결선: 앞 층과 뒤 층이 모두 보이면 자란다
    [0, 1].forEach((li) => { const s = Math.min(sh(li), sh(li + 1)); if (s <= 0) return;
      NODES[li].forEach((a) => NODES[li + 1].forEach((b) => el('line', { x1: NX[li] + 12, y1: NY + a, x2: lerp(NX[li] + 12, NX[li + 1] - 12, s), y2: lerp(NY + a, NY + b, s), stroke: OFF, 'stroke-width': 1, opacity: op * 0.8 }))); });
    NODES.forEach((col, li) => { const s = sh(li); if (s <= 0) return; const dy = (1 - s) * -40;
      col.forEach((y) => el('circle', { cx: NX[li], cy: NY + y + dy, r: 11, fill: li === 0 ? PANEL : li === 2 ? ACC : ACCBG, stroke: li === 2 ? ACC : INK, 'stroke-width': 2, opacity: op * s }));
      const nm = ['입력 4', 'Dense 64', 'Dense 3'][li], ac = ['', 'relu', 'softmax'][li];
      lbl(NX[li], NY + 140, nm, op * s, { 'font-size': 15 }); if (ac) mono(NX[li], NY + 160, ac, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op * s }); });
    if (sh(1) > 0) mono(NX[1], NY + 186, '64 개 중 8 개만 그림', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op * sh(1) }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) {
      pill(330, 70, 'from tensorflow import keras', ACC, pop(u, 0.2), { mono: true, fs: 15 });
      pill(630, 70, 'from tensorflow.keras import layers', ACC, pop(u, 0.5), { mono: true, fs: 15 });
      tx(480, 150, '필요한 이름은 이 두 개뿐', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.9) });
      ['tf.placeholder', 'tf.Session', 'feed_dict'].forEach((s, i) => { const f = E(u, 1.1 + i * 0.25, 2.3 + i * 0.2), x = 250 + i * 230, y = lerp(230, 330, f);
        const g = card(x, y, tw(s, 15) + 40, 40, { rx: 8, text: s, fs: 15, mono: true, stroke: GRID, color: MUT, op: 1 - 0.55 * f });
        el('line', { x1: x - tw(s, 15) / 2 - 8, y1: y, x2: x - tw(s, 15) / 2 - 8 + (tw(s, 15) + 16) * clamp(f * 1.5), y2: y, stroke: BAD, 'stroke-width': 2.5 }); });
      sub(480, 390, '그래프·세션 같은 저수준 도구는 무대에 오르지 않는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const sh = k === 1 ? (li) => E(u, 0.2 + li * 0.45, 0.7 + li * 0.45) : () => 1;
    net(sh, { op: k === 5 ? 0.5 : 1 });
    if (k === 1) {
      pill(250, 34, 'keras.Sequential([ … ])', INK, pop(u, 0.1), { mono: true, fs: 14 });
      const x0 = 500, rows = [['층', '출력 모양', '파라미터'], ['Dense 64', '(None, 64)', '4×64+64 = 320'], ['Dense 3', '(None, 3)', '64×3+3 = 195']];
      rows.forEach((r, i) => { const y = 108 + i * 54, op = i === 0 ? fade(u, 0.3) : fade(u, 0.9 + i * 0.45);
        if (i) el('rect', { x: x0 - 10, y: y - 30, width: 440, height: 44, rx: 8, fill: SOFT, opacity: op });
        tx(x0, y, r[0], { 'font-size': i ? 15 : 13.5, 'font-weight': 700, fill: i ? INK : MUT, opacity: op });
        mono(x0 + 110, y, r[1], { 'font-size': i ? 15 : 13.5, fill: i ? INK : MUT, opacity: op, class: i ? 'mono' : null });
        mono(x0 + 250, y, r[2], { 'font-size': i ? 15 : 13.5, 'font-weight': i ? 700 : 400, fill: i ? ACC : MUT, opacity: op }); });
      const tot = Math.round(lerp(0, 515, E(u, 2.0, 2.6)));
      card(710, 300, 260, 52, { rx: 10, stroke: ACC, fill: ACCBG, s: pop(u, 1.9) });
      mono(710, 306, `학습할 숫자 ${tot}개`, { 'font-size': 17, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.95) });
      sub(710, 360, '입력 모양만 주면 나머지 연결은 Keras 가 맞춘다', fade(u, 2.3), { 'font-size': 14 }); return; }
    if (k === 2) { const slots = [['optimizer', '"adam"', 'Adam 객체'], ['loss', '"sparse_categorical_crossentropy"', '손실 함수 객체'], ['metrics', '["accuracy"]', '정확도 계산기']];
      pill(700, 40, 'model.compile( … )', INK, pop(u, 0.1), { mono: true, fs: 14 });
      slots.forEach(([name, str, obj], i) => { const y = 110 + i * 92, f = seg(u, 0.4 + i * 0.4, 1.1 + i * 0.4), done = f >= 1;
        tx(500, y - 26, name, { 'font-size': 14, 'font-weight': 700, fill: MUT });
        card(700, y + 6, 400, 48, { rx: 10, stroke: done ? ACC : GRID, fill: done ? ACCBG : PANEL, dash: done ? null : '5 4' });
        if (!done) fly(940, y + 6, 700, y + 6, f, str, { mono: true, fill: INK });
        if (done) { tx(700, y + 12, obj, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, fill: ACC }); mono(890, y + 12, str.length > 14 ? '"sparse_…"' : str, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); } });
      sub(700, 390, '문자열 하나가 객체로 바뀐다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { // fit: 학습 루프 한 바퀴가 이 한 줄 안에
      const cx = 700, cy = 196, r = 104, st = ['배치 32개', '순전파', '손실', '역전파', '가중치 갱신'];
      pill(cx, 30, 'model.fit(x_train, y_train, epochs=5, batch_size=32)', ACC, pop(u, 0.1), { mono: true, fs: 13.5 });
      el('circle', { cx, cy, r, fill: 'none', stroke: GRID, 'stroke-width': 3 });
      st.forEach((s, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        card(x, y, tw(s, 14) + 22, 32, { rx: 16, text: s, fs: 14, fill: PANEL, stroke: i === 4 ? ACC : INK, color: i === 4 ? ACC : INK, s: pop(u, 0.3 + i * 0.15) }); });
      const a = -Math.PI / 2 + ((t * 1.6) % 1) * 2 * Math.PI; if (u > 1.0) el('circle', { cx: cx + Math.cos(a) * r, cy: cy + Math.sin(a) * r, r: 7, fill: ACC });
      const ep = Math.min(5, 1 + Math.floor(Math.max(0, u - 1.0) * 3));
      mono(cx, cy - 4, `epoch ${ep}/5`, { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      tx(cx, cy + 22, '한 줄 안에서 반복', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      for (let i = 0; i < 4; i++) dot([[NX[0], NY], [NX[1], NY], [NX[2], NY]], ((t * 0.9 + i / 4) % 1), ACC, 4.5);
      sub(700, 388, 'TF1 이라면 수십 줄이던 학습 루프', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { // predict
      pill(250, 34, 'preds = model.predict(x_new)', ACC, pop(u, 0.1), { mono: true, fs: 14 });
      for (let i = 0; i < 4; i++) { const f = E(u, 0.3 + i * 0.1, 1.0 + i * 0.1); el('rect', { x: lerp(-40, NX[0] - 70, f) + 0, y: NY - 56 + i * 28, width: 40, height: 22, rx: 4, fill: INFO, opacity: 0.85 * f }); }
      for (let i = 0; i < 4; i++) dot([[NX[0], NY], [NX[1], NY], [NX[2], NY], [500, NY]], seg(u, 1.0 + i * 0.12, 1.8 + i * 0.12), ACC, 5);
      const hs = [0.62, 0.28, 0.10];
      tx(560, 92, '클래스마다 확률 (모양 예시)', { 'font-size': 14, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.7) });
      hs.forEach((h, i) => { const g = E(u, 1.8 + i * 0.12, 2.4 + i * 0.12), H = 150 * h * g; el('rect', { x: 570 + i * 70, y: 270 - H, width: 46, height: H, rx: 4, fill: i === 0 ? ACC : ACCBG, stroke: ACC, 'stroke-width': 1.5 }); mono(593 + i * 70, 292, String(i), { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: g }); });
      mono(700, 330, '(n, 4) → (n, 3)', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) });
      sub(700, 362, '넘파이를 넣으면 넘파이가 나온다 · feed_dict 없음', fade(u, 2.4), { 'font-size': 14.5, fill: INK }); return; }
    // k5: 백엔드는 감춰 둔다
    person(700, 46, null, { s: pop(u, 0.1) });
    card(700, 140, 360, 56, { rx: 12, text: 'Keras  ·  Sequential → compile → fit', fs: 15.5, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.3) });
    grow(700, 76, 700, 108, E(u, 0.4, 0.8), ACC);
    const curtain = E(u, 1.0, 1.8);
    card(610, 290, 160, 56, { rx: 10, text: 'TensorFlow', fs: 15.5, stroke: INK, s: pop(u, 0.7) });
    card(790, 290, 160, 56, { rx: 10, text: 'Theano', fs: 15.5, stroke: INK, s: pop(u, 0.85) });
    grow(660, 170, 620, 258, E(u, 0.8, 1.2), MUT, { dash: '4 4' }); grow(740, 170, 780, 258, E(u, 0.8, 1.2), MUT, { dash: '4 4' });
    el('rect', { x: 510, y: 230, width: 380 * curtain, height: 120, rx: 10, fill: SOFT, opacity: 0.96 });
    tx(700, 222, '백엔드 엔진', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (curtain > 0.9) tx(700, 296, '사용자는 몰라도 된다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.8) });
    sub(700, 392, '이 인기 때문에 TF 가 Keras 를 흡수하게 된다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 3. TF2 대전환 — 연대기와 같은 계산
  // =========================================================
  const EV = [[136, '2015', 'TF 1.0', '정적 그래프', MUT], [276, '2015', 'Keras', '독립 고수준 API', INFO], [520, '2017', 'PyTorch', 'eager 로 연구계 흡수', WARN], [808, '2019', 'TF 2.0', 'eager 기본 · tf.keras', ACC]];
  function timeline(n, u, fresh) { const y = 66, xEnd = EV[n - 1][0];
    el('line', { x1: 80, y1: y, x2: 880, y2: y, stroke: GRID, 'stroke-width': 3 });
    el('line', { x1: 80, y1: y, x2: fresh ? lerp(n > 1 ? EV[n - 2][0] : 80, xEnd, E(u, 0.1, 0.7)) : xEnd, y2: y, stroke: ACC, 'stroke-width': 3 });
    EV.slice(0, n).forEach(([x, yr, name, what, col], i) => { const s = fresh && i === n - 1 ? pop(u, 0.5) : 1;
      el('circle', { cx: x, cy: y, r: 9 * s, fill: col });
      mono(x, y - 18, yr, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s });
      tx(x, y + 28, name, { 'font-size': 15, 'font-weight': 800, fill: col === MUT ? INK : col, 'text-anchor': 'middle', opacity: s });
      tx(x, y + 47, what, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: s }); }); }
  const T3 = ['>>> print(c)', ['tf.Tensor(5.0, shape=(), dtype=float32)', 'var(--good)'], '>>> print(c.numpy())', ['5.0', 'var(--good)']];
  function s3(t, c) { const { k, u } = c, rows = (c.beat.timeline && c.beat.timeline.rows.length) || 4, prevRows = (c.prev && c.prev.timeline && c.prev.timeline.rows.length) || 0;
    timeline(rows, u, rows > prevRows);
    if (k === 0) { toggle(300, 230, E(u, 0.8, 1.4), 'eager 즉시 실행');
      pill(640, 196, 'tf.executing_eagerly()', INK, pop(u, 0.4), { mono: true, fs: 15 });
      mono(640, 252, '→ True', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      sub(480, 350, '켜는 줄이 필요 없다 · import 한 줄이면 기본값이 eager', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { cells(250, 170, ['2.0'], { w: 90, h: 50, style: () => ({ s: pop(u, 0.2), stroke: INFO, color: INFO }) });
      tx(372, 202, '+', { 'font-size': 26, 'font-weight': 800, opacity: fade(u, 0.4) });
      cells(394, 170, ['3.0'], { w: 90, h: 50, style: () => ({ s: pop(u, 0.4), stroke: INFO, color: INFO }) });
      tx(516, 202, '=', { 'font-size': 26, 'font-weight': 800, opacity: fade(u, 0.7) });
      cells(540, 170, ['5.0'], { w: 90, h: 50, style: () => ({ s: pop(u, 0.9), stroke: GOOD, fill: GOODBG, color: GOOD }) });
      mono(250, 248, 'tf.constant', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) }); mono(394, 248, 'tf.constant', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.6) });
      tx(585, 248, '이 줄에서 계산 끝', { 'font-size': 14, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.1) });
      ['placeholder', 'Session', 'feed_dict'].forEach((s, i) => { const x = 300 + i * 180, op = fade(u, 1.5 + i * 0.2);
        card(x, 330, 150, 40, { rx: 8, text: s, fs: 15, mono: true, stroke: GRID, color: MUT, op });
        if (op > 0) el('line', { x1: x - 64, y1: 330, x2: x - 64 + 128 * E(u, 1.7 + i * 0.2, 2.2 + i * 0.2), y2: 330, stroke: BAD, 'stroke-width': 2.5 }); });
      sub(480, 385, 'TF1 의 세 단계가 한 줄로 접혔다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { terminal(150, 150, 660, 140, T3, lerp(0, 4, E(u, 0.2, 2.0)), { title: 'python · TF 2.x', fs: 15, lh: 23 });
      spans(150, 330, [['TF1 에서는  ', { fill: MUT, 'font-family': 'inherit' }], ['Tensor("add:0", dtype=float32)', { fill: MUT, 'text-decoration': 'line-through' }]], { 'font-size': 15, opacity: fade(u, 2.1) });
      sub(480, 380, 'print 와 pdb 가 그냥 된다 · PyTorch 가 연구자를 끌어간 이유', fade(u, 2.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { const f = E(u, 0.9, 1.8), pieces = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      pieces.forEach(([dx, dy], i) => { const g = R.G(300 + dx * (52 + 60 * f), 220 + dy * (24 + 40 * f), 1, 1 - 0.7 * f);
        el('rect', { x: -50, y: -22, width: 100, height: 44, rx: 6, fill: PANEL, stroke: f > 0 ? BAD : INK, 'stroke-width': 2.2, transform: `rotate(${dx * dy * 18 * f})` }, g); });
      if (f < 0.2) mono(300, 226, 'tf.Session', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      terminal(470, 150, 440, 124, ['>>> sess = tf.Session()', ['AttributeError: module', 'var(--bad)'], ["  'tensorflow' has no attribute", 'var(--bad)'], ["  'Session'", 'var(--bad)']], lerp(0, 4, E(u, 0.3, 1.9)), { title: 'python · TF 2.x', fs: 14 });
      sub(480, 360, 'TF2 에는 tf.Session 이라는 이름 자체가 없다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      sub(480, 388, '옛 TF1 예제를 돌리면 가장 먼저 여기서 멈춘다', fade(u, 2.3), { 'font-size': 14 }); return; }
    // k4, k5: 한 상자 안의 두 얼굴
    const box = [480, 262, 640, 200];
    card(box[0], box[1], box[2], box[3], { rx: 16, stroke: ACC, sw: 2.5, fill: 'none' });
    tx(box[0] - box[2] / 2 + 16, box[1] - box[3] / 2 + 24, 'TensorFlow 2.x', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    if (k === 4) { const f = E(u, 0.4, 1.5), kx = lerp(880, 350, f), ky = lerp(150, 280, f);
      card(kx, ky, 200, 64, { rx: 12, text: f > 0.95 ? 'tf.keras' : 'Keras', fs: 18, mono: f > 0.95, stroke: INFO, fill: INFOBG, color: INFO });
      card(610, 280, 200, 64, { rx: 12, text: 'eager 즉시 실행', fs: 16, stroke: ACC, fill: ACCBG, color: ACC });
      grow(EV[1][0], 120, 350, 244, E(u, 1.5, 2.1), INFO, { dash: '4 4' });
      sub(480, 400, '별도 설치 없이 tf.keras · pip install keras 가 필요 없다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    card(350, 260, 260, 110, { rx: 12, stroke: INFO, fill: INFOBG, s: pop(u, 0.2) });
    tx(350, 240, '방식 1 · 고수준', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.3) });
    mono(350, 272, 'Keras  fit()', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.4) });
    card(610, 260, 260, 110, { rx: 12, stroke: ACC, fill: ACCBG, s: pop(u, 0.5) });
    tx(610, 240, '방식 2 · 저수준', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.6) });
    mono(610, 272, 'eager  ·  GradientTape', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 0.7) });
    grow(EV[1][0], 120, 330, 202, E(u, 1.0, 1.6), INFO, { dash: '4 4' }); grow(EV[2][0], 120, 600, 202, E(u, 1.2, 1.8), WARN, { dash: '4 4' });
    sub(480, 400, '두 유산을 한꺼번에 받아들여 TF 에 두 얼굴이 생겼다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); }

  // =========================================================
  // 4. 두 방식 — fit 과 GradientTape
  // =========================================================
  const TAPE = ['x', 'model(x)', 'pred', 'loss_fn', 'loss'];
  function tapeStrip(x, y, rec, back, op) { const cw = 84, n = TAPE.length;
    [x - 26, x + n * cw + 26].forEach((cx) => { el('circle', { cx, cy: y + 20, r: 22, fill: PANEL, stroke: INK, 'stroke-width': 2.2, opacity: op });
      for (let i = 0; i < 3; i++) { const a = (back ? -1 : 1) * rec * 6 + i * 2.09; el('line', { x1: cx, y1: y + 20, x2: cx + Math.cos(a) * 16, y2: y + 20 + Math.sin(a) * 16, stroke: MUT, 'stroke-width': 2, opacity: op }); } });
    el('rect', { x, y, width: n * cw, height: 40, fill: SOFT, stroke: INK, 'stroke-width': 2, opacity: op });
    TAPE.forEach((s, i) => { const on = clamp(rec * n - i); if (on <= 0) return;
      el('rect', { x: x + i * cw + 3, y: y + 4, width: cw - 6, height: 32, rx: 4, fill: back ? BADBG : ACCBG, opacity: op * on });
      mono(x + i * cw + cw / 2, y + 25, s, { 'font-size': 13.5, 'font-weight': 700, fill: back ? BAD : ACC, 'text-anchor': 'middle', opacity: op * on }); }); }
  function s4(t, c) { const { k, u } = c;
    zone(20, 20, 330, 380, '방식 1 · 고수준 (Keras fit)', { color: INFO });
    zone(366, 20, 574, 380, '방식 2 · 저수준 (GradientTape)', { op: k < 2 ? 0.5 : 1, dash: k < 2 ? '6 5' : null, stroke: k < 2 ? GRID : 'none', fill: k < 2 ? 'none' : SOFT });
    if (k < 5) {
      card(185, 90, 230, 46, { rx: 10, text: 'Sequential([Dense(3)])', fs: 14.5, mono: true, s: k === 0 ? pop(u, 0.2) : 1 });
      card(185, 150, 230, 46, { rx: 10, text: 'compile(adam, mse)', fs: 14.5, mono: true, s: k === 0 ? pop(u, 0.6) : 1 });
      if (k >= 1) { const s = k === 1 ? pop(u, 0.2) : 1; card(185, 226, 230, 62, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2.5, s });
        mono(160, 233, 'fit(x, y)', { 'font-size': 18, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: s });
        const a = t * 4; el('path', { d: `M${262 + 12 * Math.cos(a)},${226 + 12 * Math.sin(a)} A12,12 0 1 1 ${262 + 12 * Math.cos(a + 4.7)},${226 + 12 * Math.sin(a + 4.7)}`, fill: 'none', stroke: INFO, 'stroke-width': 2.5, opacity: s });
        ['이미지 분류', '회귀·표 데이터', '전이학습 파인튜닝'].forEach((e, i) => pill(185, 300 + i * 34, e, INFO, k === 1 ? pop(u, 0.9 + i * 0.25) : 1, { fs: 13.5 }));
        if (k === 1) tx(185, 412, '표준 지도학습이면 여기서 끝', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, opacity: fade(u, 1.9) }); }
      if (k === 0) { tx(653, 210, '아직 열지 않았다', { 'text-anchor': 'middle', 'font-size': 16, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.8) });
        sub(185, 230, '모델 선언과 compile 까지는 두 방식이 같다', fade(u, 1.4), { 'font-size': 14, fill: INK }); }
    }
    if (k >= 2 && k < 5) {
      card(520, 78, 220, 44, { rx: 10, text: 'optimizer = Adam()', fs: 14, mono: true, stroke: ACC, s: k === 2 ? pop(u, 0.4) : 1 });
      card(780, 78, 260, 44, { rx: 10, text: 'loss_fn = MeanSquaredError()', fs: 13.5, mono: true, stroke: ACC, s: k === 2 ? pop(u, 0.7) : 1 });
      if (k === 2) { grow(300, 150, 404, 92, E(u, 1.1, 1.7), MUT, { dash: '5 4' });
        tx(653, 170, 'compile 이 문자열로 받던 재료를', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.6) });
        tx(653, 194, '이번엔 객체로 직접 손에 쥔다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); }
    }
    if (k === 3 || k === 4) { const x0 = 440;
      mono(x0 - 40, 140, 'for epoch …:  for x, y in dataset:', { 'font-size': 14, fill: MUT });
      mono(x0 - 40, 168, 'with tf.GradientTape() as tape:', { 'font-size': 14.5, 'font-weight': 700, fill: ACC });
      const rec = k === 3 ? E(u, 0.4, 2.2) : 1, back = k === 4 ? E(u, 0.2, 1.4) : 0;
      tapeStrip(x0, 190, rec, k === 4 && back < 1, 1);
      if (k === 3) { dot([[x0, 210], [x0 + 420, 210]], seg(u, 0.4, 2.2), ACC, 7); sub(653, 262, '블록 안에서 일어난 연산만 테이프에 남는다', fade(u, 2.2), { 'font-size': 14.5, fill: INK, 'font-weight': 700 }); }
      if (k === 4) { dot([[x0 + 420, 210], [x0, 210]], seg(u, 0.2, 1.4), BAD, 7);
        pill(560, 268, 'grads = tape.gradient(loss, …)', BAD, pop(u, 1.3), { mono: true, fs: 13.5 });
        grow(700, 268, 742, 268, E(u, 1.6, 1.9), MUT);
        const wv = [['W', 1.6], ['b', 1.8]]; wv.forEach(([n, a], i) => card(790 + i * 60, 268, 50, 40, { rx: 6, text: n, fs: 16, mono: true, fill: u > a + 0.2 ? GOODBG : PANEL, stroke: u > a + 0.2 ? GOOD : INK, color: u > a + 0.2 ? GOOD : INK }));
        mono(820, 310, 'apply_gradients', { 'font-size': 13.5, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
        ['GAN', '강화학습', '논문 재현'].forEach((e, i) => pill(520 + i * 135, 360, e, ACC, pop(u, 2.0 + i * 0.15), { fs: 13.5 })); }
    }
    if (k === 5) { const g = E(u, 0.2, 1.1);
      const w = lerp(300, 820, g), h = lerp(80, 300, g), cx = lerp(185, 480, g), cy = lerp(226, 216, g);
      el('rect', { x: 0, y: 0, width: 960, height: 420, fill: PANEL, opacity: 0.85 * g });
      card(cx, cy, w, h, { rx: 16, stroke: INFO, fill: INFOBG, sw: 3 });
      mono(cx - w / 2 + 20, cy - h / 2 + 30, 'model.fit(x, y)', { 'font-size': 18, 'font-weight': 800, fill: INFO });
      if (g > 0.95) { card(480, 230, 640, 150, { rx: 12, stroke: ACC, fill: PANEL, s: pop(u, 1.1) });
        tx(480, 186, '안에서 매 배치마다 도는 한 스텝', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.2) });
        ['GradientTape 기록', 'tape.gradient', 'apply_gradients'].forEach((s, i) => { card(280 + i * 200, 240, 170, 46, { rx: 10, text: s, fs: 14.5, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.3 + i * 0.2) }); if (i) grow(280 + (i - 1) * 200 + 86, 240, 280 + i * 200 - 88, 240, E(u, 1.4 + i * 0.2, 1.7 + i * 0.2), ACC); });
        tx(480, 400, 'fit ⊃ GradientTape · 대립이 아니라 포함 관계', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.1) }); } } }

  // =========================================================
  // 5. 학습 지도 — Part Ⅱ · Part Ⅲ · 종합, 그리고 tf.function
  // =========================================================
  const MS = [[170, 'Part Ⅱ', '방식 1 · Keras fit', 'Sequential · compile · fit · callback', INFO], [480, 'Part Ⅲ', '방식 2 · GradientTape', '커스텀 루프 · 손실 · tf.function', ACC], [790, '종합', '같은 모델 · 두 방식', 'fit 과 tape 를 나란히 비교', GOOD]];
  function road(u, fresh, op) { const y = 92;
    el('line', { x1: 60, y1: y, x2: fresh ? lerp(60, 900, E(u, 0.1, 1.6)) : 900, y2: y, stroke: GRID, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: op });
    MS.forEach(([x, part, way, focus, col], i) => { const s = fresh ? pop(u, 0.4 + i * 0.5) : 1; if (s <= 0) return;
      card(x, y, 96, 36, { rx: 18, text: part, fs: 15, fill: col, stroke: 'none', color: PANEL, s, op });
      tx(x, y + 44, way, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: col, opacity: op * s });
      tx(x, y + 66, focus, { 'text-anchor': 'middle', 'font-size': 13.5, fill: MUT, opacity: op * s }); }); }
  const STEP = ['with GradientTape()', 'pred = model(x)', 'loss = loss_fn(…)', 'tape.gradient', 'apply_gradients', 'return loss'];
  function stepChain(n, u, lit) { STEP.forEach((s, i) => { const x = 110 + (i % 3) * 250, y = i < 3 ? 260 : 340, on = i < n;
      card(x + 60, y, 220, 50, { rx: 10, text: s, fs: 14.5, mono: true, stroke: on ? ACC : GRID, fill: on && lit(i) ? ACCBG : PANEL, color: on ? INK : OFF, s: on ? 1 : 0.95 });
      if (i % 3 && on) grow(x - 80, y, x - 52, y, 1, ACC); });
    if (n > 3) grow(670, 285, 110, 315, 1, MUT, { dash: '4 4', plain: true }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { road(u, true, 1);
      card(480, 300, 560, 70, { rx: 14, stroke: GRID, s: pop(u, 2.0) });
      tx(480, 296, '어디서 무엇을 배우는지 먼저 본다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.1) });
      tx(480, 318, 'Part Ⅱ 는 fit 의 근육, Part Ⅲ 는 fit 이 대신 해준 것', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const isl = (cx, col, a, b, s) => { el('ellipse', { cx, cy: 260, rx: 150, ry: 54, fill: col === ACC ? ACCBG : INFOBG, stroke: col, 'stroke-width': 2.5, opacity: s });
        tx(cx, 254, a, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: col, opacity: s }); tx(cx, 280, b, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: s }); };
      isl(200, INFO, 'eager', '편하다 · 디버깅 쉬움', fade(u, 0.2)); isl(760, ACC, '그래프', '빠르다 · 재사용', fade(u, 0.5));
      const g = E(u, 0.9, 1.8), pts = []; for (let i = 0; i <= 30 * g; i++) { const f = i / 30, x = lerp(350, 610, f), y = 230 - Math.sin(f * Math.PI) * 70; pts.push(`${x},${y}`); }
      if (pts.length > 1) el('polyline', { points: pts.join(' '), fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' });
      pill(480, 136, '@tf.function', ACC, pop(u, 1.8), { mono: true, fs: 16 });
      tx(480, 92, '평소엔 eager, 필요하면 그래프', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 2.1) });
      sub(480, 370, 'TF1 의 속도와 TF2 의 편함을 한 프로젝트에서 같이 쓴다', fade(u, 2.3), { 'font-size': 15, fill: INK }); return; }
    if (k === 2) { const st = E(u, 0.5, 1.1), morph = E(u, 1.4, 2.2);
      card(330, 210, 340, 150, { rx: 12, stroke: INK, op: 1 - morph * 0.8 });
      ['def train_step(x, y):', '    with GradientTape() …', '    …', '    return loss'].forEach((s, i) => mono(180, 168 + i * 28, s, { 'font-size': 14.5, opacity: 1 - morph * 0.8 }));
      const sy = lerp(40, 112, st); pill(330, sy, '@tf.function', ACC, st > 0 ? 1 : 0, { mono: true, fs: 16, fill: ACCBG });
      if (morph > 0) { const P = [[640, 160], [640, 260], [760, 210], [870, 210]];
        [[0, 2], [1, 2], [2, 3]].forEach(([a, b]) => grow(P[a][0] + 18, P[a][1], P[b][0] - 18, P[b][1], morph, MUT));
        P.forEach(([x, y], i) => node(x, y, 18, ['x', 'W', '×', 'loss'][i], { s: morph, fs: i === 3 ? 12.5 : 15, stroke: ACC }));
        grow(510, 210, 600, 210, morph, ACC);
        tx(760, 318, '파이썬 함수 → 그래프', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: morph }); }
      sub(480, 395, '데코레이터 한 줄로 그래프 컴파일 대상이 된다 · 규칙은 I-2-1', fade(u, 2.3), { 'font-size': 14.5, fill: INK }); return; }
    if (k === 3 || k === 4) { pill(480, 60, '@tf.function  def train_step(x, y):', ACC, 1, { mono: true, fs: 15 });
      tx(480, 120, k === 3 ? '안쪽은 Part Ⅲ 의 GradientTape 블록 그대로' : '기울기 → 갱신 → 손실 반환 = 학습 한 스텝', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
      const n = k === 3 ? Math.min(3, Math.floor(lerp(0, 3.99, E(u, 0.3, 2.0)))) : 3 + Math.min(3, Math.floor(lerp(0, 3.99, E(u, 0.3, 2.0))));
      stepChain(n, u, (i) => (k === 3 ? i < 3 : i >= 3));
      if (k === 4 && u > 2.2) tx(480, 400, '이 한 스텝을 손으로 짤 수 있게 되는 것이 Part Ⅲ 의 목표', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 5) { const x0 = 230, maxW = 560;
      tx(480, 60, '같은 train_step 을 다섯 번 부르면', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
      for (let i = 0; i < 5; i++) { const y = 104 + i * 50, w = i === 0 ? maxW * 0.9 : maxW * 0.16, g = E(u, 0.3 + i * 0.35, 0.9 + i * 0.35);
        mono(x0 - 20, y + 20, `${i + 1}번째 호출`, { 'font-size': 14.5, 'text-anchor': 'end', opacity: fade(u, 0.3 + i * 0.35) });
        if (i === 0) { el('rect', { x: x0, y, width: w * 0.72 * g, height: 30, rx: 5, fill: WARN }); el('rect', { x: x0 + w * 0.72 * g, y, width: w * 0.28 * g, height: 30, rx: 5, fill: ACC });
          if (g > 0.9) { tx(x0 + 12, y + 21, '그래프 추적 (trace)', { 'font-size': 14, 'font-weight': 700, fill: PANEL }); } }
        else el('rect', { x: x0, y, width: w * g, height: 30, rx: 5, fill: ACC });
        if (i > 0 && g > 0.9) tx(x0 + w + 12, y + 21, '그래프 재사용', { 'font-size': 14, fill: MUT }); }
      sub(480, 372, '막대는 모양 예시 · 첫 호출만 추적 비용을 치른다', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k6: 어느 방식부터
    road(u, false, 0.35);
    const g = c.beat.guide || [];
    [['실무 입문 · 대부분의 개발자', '방식 1 먼저', '결과와 성취를 먼저 얻는다', INFO, 170], ['GAN · 강화학습 · 연구 지망', '방식 2 를 일찍', '커스텀 루프가 곧 본론이다', ACC, 480]].forEach(([who, pick, why, col, tx0], i) => { const y = 220 + i * 92, s = pop(u, 0.3 + i * 0.6);
      person(70, y, null, { s, stroke: col });
      tx(110, y - 8, who, { 'font-size': 15, 'font-weight': 700, opacity: s }); tx(110, y + 16, why, { 'font-size': 13.5, fill: MUT, opacity: s });
      grow(420, y, tx0 === 170 ? 540 : 540, y, E(u, 0.6 + i * 0.6, 1.0 + i * 0.6), col);
      card(650, y, 190, 46, { rx: 23, text: pick, fs: 15.5, fill: col, stroke: 'none', color: PANEL, s: pop(u, 0.9 + i * 0.6) }); });
    tx(480, 404, '어느 쪽이든 "fit 이 대신 해준 것" 을 대조 축으로', { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 800, opacity: fade(u, 2.2) }); }


  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: 'TF1 코드에서 c = a + b 다음 줄에 print(c) 를 하면 무엇이 찍히나?',
      o: ['5.0', 'Tensor("add:0", dtype=float32) 같은 노드 이름', 'None'], a: 1,
      why: 'TF1 에서 c 는 값이 아니라 그래프의 add 노드다. 값 5.0 은 Session 을 열고 feed_dict 로 2.0 과 3.0 을 넣어야 나온다.' },
    { q: 'Keras 의 model.fit(x, y, epochs=5) 한 줄이 대신 하는 일은 무엇인가?',
      o: ['모델 층을 쌓는 일', '손실·옵티마이저를 문자열로 고르는 일', '배치를 나눠 순전파·손실·역전파·갱신을 반복하는 학습 루프'], a: 2,
      why: '층 쌓기는 Sequential, 재료 고르기는 compile 이 맡는다. fit 은 그 재료로 학습 루프 전체를 5 epoch 돌린다.' },
    { q: 'TF 2.0 에서 tf.Session() 을 부르면 어떻게 되나?',
      o: ['AttributeError 가 난다', '예전처럼 실행 엔진이 열린다', '경고만 내고 eager 로 실행한다'], a: 0,
      why: 'TF2 는 eager 를 기본값으로 바꾸면서 tf.Session 을 없앴다. 그래서 옛 TF1 예제가 가장 먼저 여기서 멈춘다.' },
    { q: 'model.fit() 과 GradientTape 는 어떤 관계인가?',
      o: ['서로 다른 엔진이라 섞어 쓸 수 없다', 'fit 한 스텝의 안쪽이 GradientTape 로 되어 있다', 'GradientTape 가 fit 을 불러 쓴다'], a: 1,
      why: 'fit 은 가장 흔한 학습 루프를 포장한 것이고, 매 배치 한 스텝은 테이프 기록, gradient, apply_gradients 순서로 돈다. 대립이 아니라 포함 관계다.' },
    { q: '@tf.function 을 붙인 train_step 이 첫 호출에서만 느린 이유는 무엇인가?',
      o: ['첫 호출에서 파이썬 함수를 그래프로 추적하기 때문', '가중치를 처음 내려받기 때문', 'GPU 를 처음 켜기 때문'], a: 0,
      why: '첫 호출에서 그래프를 추적(trace)하고, 그다음 호출부터는 만든 그래프를 다시 쓴다. 그래서 eager 의 편함과 그래프의 속도를 같이 얻는다.' },
  ];

  const summary = [
    'TF1 은 그래프를 먼저 선언하고 Session 을 열어야 값이 나와서 print 로 디버깅할 수 없었다.',
    '같은 해 나온 Keras 는 Sequential, compile, fit 세 단계로 학습을 끝내 진입장벽을 낮췄다.',
    'TF2 는 eager 를 기본값으로 바꾸고 tf.Session 을 지웠으며 Keras 를 tf.keras 로 품었다.',
    '그래서 TF 에는 fit 과 GradientTape 두 방식이 있고, fit 의 한 스텝 안에 tape 가 들어 있다.',
  ];
  const review = [
    { q: '인터넷에서 찾은 예제가 tf.placeholder 와 sess.run 을 쓰는데, TF 2.x 에서 돌리자 바로 에러가 났다. 먼저 의심할 것은?',
      o: ['TF1 시절 정적 그래프 코드라 TF2 에는 없는 API 를 쓴다', 'GPU 드라이버가 오래됐다', 'Keras 를 따로 설치하지 않았다'], a: 0,
      why: 'placeholder·Session·feed_dict 는 TF1 의 선언 후 실행 방식이다. TF2 에서는 tf.Session 자체가 없어 AttributeError 가 난다.' },
    { q: '생성자와 판별자의 손실을 번갈아 갱신하는 GAN 을 만들어야 한다. 어느 쪽이 맞나?',
      o: ['fit 한 줄이면 충분하다', 'GradientTape 로 학습 루프를 직접 짠다', 'TF1 Session 으로 돌아간다'], a: 1,
      why: 'fit 은 표준 지도학습 루프를 포장한 것이다. 두 손실을 번갈아 다루는 루프는 tape.gradient 와 apply_gradients 로 손수 짜야 한다.' },
    { q: 'eager 로 짠 학습 스텝이 느려서 @tf.function 을 붙였더니 첫 호출만 오래 걸리고 이후는 빨라졌다. 이 현상의 설명으로 맞는 것은?',
      o: ['첫 호출에서 데이터를 캐시에 올렸다', '두 번째부터 eager 로 돌아갔다', '첫 호출에서 그래프를 추적하고 이후 재사용했다'], a: 2,
      why: 'tf.function 은 첫 호출에 그래프를 만들고 다음부터 그 그래프만 실행한다. TF1 그래프의 속도를 TF2 안에서 되찾는 장치다.' },
  ];

  R.page({ title: 'TensorFlow 가 걸어온 길', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
