/* II-2-1 함수형 API — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 모양·파라미터 수는 venv(TF 2.21 · Keras 3.15.1)에서 페이지 코드를 그대로 만들어 summary()/count_params() 로 확인했다.
 *  ①② 4→64→32→1: 320 · 2,080 · 33 = 2,433 (Sequential 과 함수형이 같다)
 *  ③ 와이드&딥: Dense(16) 144 · Dense(16) 272 · add 0 · concatenate (None, 24) 0 · Dense(1) 25 = 441
 *  ④ conv2d (None,62,62,16) 448 · embedding (None,20,32) 320,000 · lstm (None,32) 8,320 · concat (None,48) · dense 3,136 · price 65 · category 650 = 332,619
 *  ⑤ 4→32→1 세 방식 모두 193 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO, INFOBG, GOODBG, BADBG, WARNBG } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // 층 상자: 이름 · 출력 모양 · 파라미터
  function layer(cx, cy, name, shape, params, o) { o = o || {}; const w = o.w || 128, h = params != null ? 66 : 50;
    card(cx, cy, w, h, { rx: 9, stroke: o.col || INK, fill: o.fill || PANEL, sw: o.sw || 2, s: o.s, op: o.op, dash: o.dash });
    const op = (o.op ?? 1) * clamp(o.s ?? 1);
    tx(cx, cy - h / 2 + 20, name, { 'font-size': o.fs || 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: o.col && o.col !== INK ? o.col : INK, opacity: op });
    mono(cx, cy - h / 2 + 39, shape, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op });
    if (params != null) mono(cx, cy - h / 2 + 57, fmt(params), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: op }); }
  // 작은 그래프 노드
  const node = (x, y, s, col, sc, w) => card(x, y, w || tw(s, 13.5) + 20, 28, { rx: 7, text: s, fs: 13.5, stroke: col || INK, s: sc });

  // ---------- 1. Sequential 의 벽 ----------
  const WALLS = [
    ['다중 입력', (x, y, g) => { [['이미지', -46], ['텍스트', 0], ['수치', 46]].forEach(([s, d], i) => { node(x + 50, y + d, s, INK, g, 66); grow(x + 84, y + d, x + 150, y, g, MUT); }); node(x + 190, y, 'concat', INK, g, 76); }],
    ['다중 출력', (x, y, g) => { node(x + 50, y, '특징 h', INK, g, 70); [['가격', -36], ['카테고리', 36]].forEach(([s, d]) => { grow(x + 86, y, x + 150, y + d, g, MUT); node(x + 196, y + d, s, INK, g, 82); }); }],
    ['분기 · 병합', (x, y, g) => { node(x + 40, y + 20, 'x', INK, g, 40); node(x + 120, y + 20, 'Dense', INK, g, 66); node(x + 210, y + 20, 'add', INK, g, 50);
      grow(x + 62, y + 20, x + 86, y + 20, g, MUT); grow(x + 154, y + 20, x + 184, y + 20, g, MUT);
      if (g > 0.3) el('path', { d: `M${x + 40},${y + 5} Q${x + 125},${y - 50} ${x + 210},${y + 5}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: g }); }],
    ['공유 층', (x, y, g) => { node(x + 44, y - 32, '문장 A', INK, g, 70); node(x + 44, y + 32, '문장 B', INK, g, 70); node(x + 170, y, 'Embedding 하나', ACC, g, 124);
      grow(x + 80, y - 30, x + 106, y - 8, g, MUT); grow(x + 80, y + 30, x + 106, y + 8, g, MUT); }],
  ];
  function s1(t, c) { const { k, u } = c;
    if (k === 0) { ['keras.Sequential', 'layers.Dense', 'layers.Conv2D', 'layers.LSTM', '…'].forEach((s, i) => pill(140 + i * 160 - (i === 4 ? 40 : 0), 120, s, INK, pop(u, 0.2 + i * 0.2), { mono: true }));
      zone(60, 180, 840, 200, '아직 모델은 없다 · 도구만 있다', { fill: SOFT, op: fade(u, 1.2), dash: '6 5', stroke: GRID }); return; }
    // 왼쪽: 일직선 스택
    const L = [['Input', '(None, 4)', null], ['Dense(64) relu', '(None, 64)', 320], ['Dense(32) relu', '(None, 32)', 2080], ['Dense(1)', '(None, 1)', 33]];
    L.forEach(([n, sh, p], i) => { const y = 66 + i * 88, sc = k === 1 ? pop(u, 0.2 + i * 0.35) : 1;
      layer(150, y, n, sh, p, { s: sc, w: 170, col: i === 3 ? ACC : INK }); if (i) grow(150, y - 56, 150, y - 36, k === 1 ? E(u, 0.2 + i * 0.35, 0.5 + i * 0.35) : 1, MUT); });
    mono(150, 410, '합계 ' + fmt(k === 1 ? lerp(0, 2433, E(u, 1.2, 2.2)) : 2433), { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
    if (k === 1) { sub(560, 200, '입력 1 → 스택 → 출력 1', fade(u, 1.6), { 'font-weight': 700, fill: INK, 'font-size': 17 }); sub(560, 230, '갈래도 합류도 없다', fade(u, 1.9), { 'font-size': 15 }); return; }
    // 오른쪽: 벽 네 개
    const nW = Math.min(4, k - 1);
    WALLS.slice(0, nW).forEach(([name, draw], i) => { const x = 330 + (i % 2) * 315, y = 40 + Math.floor(i / 2) * 175, isNew = k === i + 2;
      el('rect', { x, y, width: 300, height: 160, rx: 12, fill: k === 6 ? WARNBG : BADBG, opacity: isNew ? fade(u, 0.1) : 1 });
      tx(x + 14, y + 24, name, { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: isNew ? fade(u, 0.1) : 1 });
      draw(x + 20, y + 92, isNew ? E(u, 0.3, 1.3) : 1);
      cross(x + 270, y + 26, 10, isNew ? pop(u, 1.6) : 1); });
    if (k === 6) { banner(640, 396, '스택이 아니라 그래프(DAG) · add() 는 1입력 1출력', pop(u, 0.4)); } }

  // ---------- 2. 함수형 문법 ----------
  const TOK = [['inputs', '(None, 4)'], ['x', '(None, 64)'], ['x', '(None, 32)'], ['outputs', '(None, 1)']];
  const LAY = [['Dense(64)', 320], ['Dense(32)', 2080], ['Dense(1)', 33]];
  const TX = (i) => 80 + i * 260, LX = (i) => 210 + i * 260, TY = 140;
  const CODE2 = ['inputs = Input(shape=(4,))', 'x = layers.Dense(64, "relu")(inputs)', 'x = layers.Dense(32, "relu")(x)', 'outputs = layers.Dense(1)(x)', 'model = Model(inputs, outputs)'];
  function token(i, s, o) { o = o || {}; const [n, sh] = TOK[i];
    card(TX(i), TY, 112, 52, { rx: 26, stroke: o.col || INFO, fill: INFOBG, sw: 2.2, s, dash: i === 0 ? '6 4' : null });
    tx(TX(i), TY - 4, n, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: clamp(s) });
    mono(TX(i), TY + 16, sh, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) }); }
  function s2(t, c) { const { k, u } = c;
    if (k === 0) { pill(330, 160, 'Input', ACC, pop(u, 0.3), { fs: 17 }); pill(630, 160, 'Model', ACC, pop(u, 0.6), { fs: 17 });
      sub(330, 210, '그래프의 시작', fade(u, 1.0), { 'font-weight': 700 }); sub(630, 210, '그래프의 끝을 묶는다', fade(u, 1.2), { 'font-weight': 700 });
      grow(380, 160, 580, 160, E(u, 1.4, 2.2), MUT, { dash: '6 5' }); sub(480, 140, '사이는 텐서로 잇는다', fade(u, 1.8), { 'font-weight': 700, fill: INK }); return; }
    const nT = Math.min(4, k), nL = Math.min(3, k - 1);
    for (let i = 0; i < nT; i++) token(i, i === k - 1 && k <= 4 ? pop(u, i === 0 ? 0.3 : 1.3) : 1);
    for (let i = 0; i < nL; i++) { const isNew = i === k - 2, sc = isNew ? pop(u, 0.2) : 1;
      layer(LX(i), TY + 96, LAY[i][0], '함수', null, { s: sc, w: 120, col: ACC, fill: ACCBG });
      mono(LX(i), TY + 140, fmt(LAY[i][1]) + ' 개', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: isNew ? fade(u, 1.5) : 1 });
      grow(TX(i) + 56, TY, TX(i + 1) - 56, TY, isNew ? E(u, 0.9, 1.3) : 1, ACC);
      if (isNew) fly(TX(i) + 20, TY + 44, LX(i), TY + 96, seg(u, 0.3, 0.9), TOK[i][0], { mono: true, fill: INFO }); }
    if (k === 1) sub(TX(0), TY + 50, '값 없이 모양만', fade(u, 1.0), { 'font-weight': 700, fill: INFO });
    // 아래: 코드 줄
    const nC = Math.min(5, k);
    CODE2.slice(0, nC).forEach((s, i) => { const y = 300 + i * 24, hi = i === nC - 1 && k <= 5; mono(60, y, s, { 'font-size': 14.5, fill: hi ? ACC : INK, 'font-weight': hi ? 700 : 400, opacity: hi && k <= 5 ? fade(u, 0.2) : 1 }); });
    if (k === 5) { // Model 이 끝에서 시작으로 경로를 되짚는다
      el('path', { d: `M${TX(0)},${TY - 34} L${TX(0)},${TY - 60} L${TX(3)},${TY - 60} L${TX(3)},${TY - 34}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.3) });
      tx((TX(0) + TX(3)) / 2, TY - 70, 'Model(inputs, outputs)', { 'font-size': 15, 'font-weight': 800, class: 'mono', fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      dot([[TX(3), TY], [TX(0), TY]], seg(u, 0.8, 2.4), BAD, 7); sub(640, 340, '끝에서 시작까지 거꾸로 따라가 그래프 완성', fade(u, 1.2), { 'font-weight': 700, fill: INK }); }
    if (k === 6) { [['Sequential', 2433], ['함수형', 2433]].forEach(([n, v], i) => { card(720, 290 + i * 60, 220, 48, { rx: 10, stroke: i ? ACC : INK, sw: 2, s: pop(u, 0.3 + i * 0.4) });
        tx(630, 296 + i * 60, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4 + i * 0.4) });
        mono(820, 296 + i * 60, fmt(lerp(0, v, E(u, 0.4 + i * 0.4, 1.4 + i * 0.4))), { 'font-size': 17, 'font-weight': 800, fill: i ? ACC : INK, 'text-anchor': 'end' }); });
      sub(720, 410, 'compile · fit 은 그대로', fade(u, 2.0), { 'font-weight': 700, fill: INK }); }
    if (k === 7) { [[-1, '갈래 ?'], [1, '합류 ?']].forEach(([d, s], i) => { const x = TX(1), y = TY + d * 0;
        grow(x + 20, TY - 26, x + 110, TY - 70, E(u, 0.3 + i * 0.4, 0.9 + i * 0.4), WARN, { dash: '5 4', plain: true }); });
      pill(TX(1) + 140, TY - 78, '다른 층에도 넣을 수 있다', WARN, pop(u, 1.0), { fs: 13.5 });
      sub(700, 360, '텐서가 이름 있는 변수라서 어디서든 갈라내고 합친다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); } }

  // ---------- 3. 분기와 병합 (텐서를 칸으로) ----------
  const CS = 12;
  function strip(x, y, n, col, o) { o = o || {}; for (let i = 0; i < n; i++) { const s = clamp((o.u ?? 1) * n - i);
      if (s > 0) el('rect', { x: x + i * CS, y, width: CS - 2, height: 22, rx: 2, fill: (o.cols && o.cols(i)) || col, opacity: 0.25 + 0.6 * s * (o.op ?? 1) }); } }
  const P3 = { in: [40, 210], h: [200, 90], z: [450, 90], d: [700, 90], cat: [330, 300], out: [780, 311] };
  function lab(x, y, a, b, op, col) { tx(x, y, a, { 'font-size': 15, 'font-weight': 700, fill: col || INK, opacity: op }); if (b) mono(x, y + 20, b, { 'font-size': 13.5, fill: MUT, opacity: op }); }
  function s3(t, c) { const { k, u } = c;
    strip(...P3.in, 8, INFO, { u: k === 0 ? E(u, 0.2, 1.0) : 1 }); lab(P3.in[0], P3.in[1] + 44, 'inputs', '(None, 8)', 1, INFO);
    if (k === 0) { sub(400, 330, '하나를 두 곳에 넣으면 그대로 갈래가 된다', fade(u, 1.4), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    // deep 경로
    const hU = k === 1 ? E(u, 0.4, 1.4) : 1; grow(140, 210, 196, 112, k === 1 ? E(u, 0.1, 0.5) : 1, ACC);
    strip(...P3.h, 16, ACC, { u: hU }); lab(P3.h[0], P3.h[1] - 14, 'h = Dense(16)(inputs)', null, 1); mono(P3.h[0], P3.h[1] + 44, '(None, 16) · 144 = 8×16+16', { 'font-size': 13.5, fill: MUT, opacity: k === 1 ? fade(u, 1.2) : 1 });
    if (k >= 2) { const zU = k === 2 ? E(u, 0.4, 1.4) : 1; grow(396, 101, 446, 101, k === 2 ? E(u, 0.1, 0.4) : 1, ACC);
      strip(...P3.z, 16, ACC, { u: zU }); lab(P3.z[0], P3.z[1] - 14, 'z = Dense(16)(h)', null, 1); mono(P3.z[0], P3.z[1] + 44, '(None, 16) · 272 = 16×16+16', { 'font-size': 13.5, fill: MUT, opacity: k === 2 ? fade(u, 1.2) : 1 });
      if (k === 2) sub(470, 200, 'h 와 z 는 모양이 같다 · 그래야 더할 수 있다', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'font-size': 15 }); }
    if (k >= 3) { const a = k === 3 ? E(u, 0.3, 1.4) : 1;
      // skip: h 가 z 를 건너뛰어 add 로
      el('path', { d: `M${P3.h[0] + 96},${P3.h[1] - 4} Q${P3.z[0] + 140},${-20} ${P3.d[0] + 96},${P3.d[1] - 4}`, fill: 'none', stroke: WARN, 'stroke-width': 3, 'stroke-dasharray': '7 5', opacity: k === 3 ? fade(u, 0.2) : 0.7 });
      tx(P3.z[0] + 96, 28, 'skip connection', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 0.4) : 1 });
      if (a < 1) { strip(lerp(P3.h[0], P3.d[0], a), P3.h[1], 16, WARN, { op: 0.8 }); strip(lerp(P3.z[0], P3.d[0], a), P3.z[1], 16, ACC, {}); }
      else strip(...P3.d, 16, ACC, { cols: () => GOOD });
      lab(P3.d[0], P3.d[1] + 44, 'deep = add([h, z])', '(None, 16) · 0', a >= 1 ? 1 : 0, GOOD); }
    if (k >= 4) { const a = k === 4 ? E(u, 0.3, 1.5) : 1;
      if (a < 1) { strip(lerp(P3.in[0], P3.cat[0], a), lerp(P3.in[1], P3.cat[1], a), 8, INFO, {}); strip(lerp(P3.d[0], P3.cat[0] + 8 * CS, a), lerp(P3.d[1], P3.cat[1], a), 16, GOOD, {}); }
      else strip(...P3.cat, 24, ACC, { cols: (i) => (i < 8 ? INFO : GOOD) });
      lab(P3.cat[0], P3.cat[1] + 44, 'merged = concatenate([inputs, deep])', '(None, 24) · 8 + 16 = 24', a >= 1 ? 1 : fade(u, 1.0));
      if (k === 4) sub(480, 400, 'add 는 겹쳐 더하고, concatenate 는 옆으로 잇는다', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'font-size': 15 }); }
    if (k >= 5) { grow(P3.cat[0] + 290, 311, P3.out[0] - 20, 311, k === 5 ? E(u, 0.2, 0.6) : 1, ACC);
      layer(P3.out[0] + 50, P3.out[1], 'Dense(1)', '(None, 1)', 25, { s: k === 5 ? pop(u, 0.5) : 1, w: 120, col: ACC });
      if (k === 5) { mono(P3.out[0] + 50, 380, 'Total ' + fmt(lerp(0, 441, E(u, 1.0, 2.0))), { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC });
        sub(P3.out[0] + 50, 404, 'Model(inputs, outputs)', fade(u, 1.6), { class: 'mono', 'font-weight': 700 }); } }
    if (k === 6) { const rows = [['add', '← dense, dense_1'], ['concatenate', '← input_layer, add'], ['dense_2', '← concatenate']];
      rows.forEach(([a, b], i) => { const x = 30 + i * 300, op = fade(u, 0.3 + i * 0.4);
        card(x + 140, 400, 280, 32, { rx: 8, stroke: GRID, sw: 1.5, op }); mono(x + 12, 405, a, { 'font-size': 14, 'font-weight': 700, opacity: op }); mono(x + 268, 405, b, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); }); } }

  // ---------- 4. 다중 입력 · 출력 ----------
  const M4 = { iy: 100, ty: 290, x: [80, 225, 370], cx: 520, dx: 655, hx: 830, py: 120, cy: 270 };
  function imgIcon(x, y, s) { [2, 1, 0].forEach((d) => el('rect', { x: x - 22 + d * 6, y: y - 26 - d * 6, width: 40, height: 40, rx: 3, fill: PANEL, stroke: [BAD, GOOD, INFO][d], 'stroke-width': 2, opacity: s })); }
  function s4(t, c) { const { k, u } = c, ap = (kk, d) => (k === kk ? pop(u, d) : 1), gr = (kk, a, b) => (k === kk ? E(u, a, b) : 1);
    // 이미지 갈래
    layer(M4.x[0], M4.iy, 'image', '(64,64,3)', 0, { s: ap(0, 0.2), w: 120, col: INFO });
    layer(M4.x[1], M4.iy, 'Conv2D(16,3)', '(62,62,16)', 448, { s: ap(0, 0.7), w: 130 }); grow(M4.x[0] + 60, M4.iy, M4.x[1] - 66, M4.iy, gr(0, 0.5, 0.8), MUT);
    layer(M4.x[2], M4.iy, 'GAP 2D', '(None, 16)', 0, { s: ap(0, 1.2), w: 120 }); grow(M4.x[1] + 66, M4.iy, M4.x[2] - 60, M4.iy, gr(0, 1.0, 1.3), MUT);
    if (k === 0) { sub(300, 200, 'Input 을 두 개 만들 수 있다 · Sequential 과 다른 점', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    layer(M4.x[0], M4.ty, 'text', '(None, 20)', 0, { s: ap(1, 0.2), w: 120, col: INFO });
    layer(M4.x[1], M4.ty, 'Embedding', '(20, 32)', 320000, { s: ap(1, 0.7), w: 130 }); grow(M4.x[0] + 60, M4.ty, M4.x[1] - 66, M4.ty, gr(1, 0.5, 0.8), MUT);
    layer(M4.x[2], M4.ty, 'LSTM(32)', '(None, 32)', 8320, { s: ap(1, 1.2), w: 120 }); grow(M4.x[1] + 66, M4.ty, M4.x[2] - 60, M4.ty, gr(1, 1.0, 1.3), MUT);
    if (k === 1) { sub(300, 200, '두 갈래는 서로 모른 채 따로 자란다', fade(u, 1.8), { 'font-weight': 700, fill: INK, 'font-size': 15 }); return; }
    grow(M4.x[2] + 60, M4.iy + 10, M4.cx - 60, 185, gr(2, 0.1, 0.5), ACC); grow(M4.x[2] + 60, M4.ty - 10, M4.cx - 60, 205, gr(2, 0.1, 0.5), ACC);
    layer(M4.cx, 195, 'concatenate', '(None, 48)', 0, { s: ap(2, 0.5), w: 120, col: ACC });
    layer(M4.dx, 195, 'Dense(64) h', '(None, 64)', 3136, { s: ap(2, 1.0), w: 120 }); grow(M4.cx + 60, 195, M4.dx - 60, 195, gr(2, 0.9, 1.2), MUT);
    if (k === 2) { sub(M4.cx, 250, '16 + 32 = 48', fade(u, 1.4), { class: 'mono', 'font-weight': 700, fill: ACC }); return; }
    grow(M4.dx + 60, 185, M4.hx - 66, M4.py + 10, gr(3, 0.1, 0.5), GOOD);
    layer(M4.hx, M4.py, 'price', '(None, 1)', 65, { s: ap(3, 0.5), w: 130, col: GOOD });
    if (k === 3) { sub(M4.hx, 40, 'name="price"', fade(u, 1.0), { class: 'mono', 'font-weight': 700, fill: GOOD }); return; }
    grow(M4.dx + 60, 205, M4.hx - 66, M4.cy - 10, gr(4, 0.1, 0.5), WARN);
    layer(M4.hx, M4.cy, 'category', '(None, 10)', 650, { s: ap(4, 0.5), w: 130, col: WARN });
    if (k === 4) { sub(M4.hx, 340, '같은 h 를 두 층에 넣었다', fade(u, 1.0), { 'font-weight': 700, fill: INK }); return; }
    if (k === 5) { el('rect', { x: 14, y: 52, width: 140, height: 286, rx: 12, fill: 'none', stroke: INFO, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.3) });
      el('rect', { x: 758, y: 76, width: 144, height: 240, rx: 12, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '7 5', opacity: fade(u, 0.7) });
      tx(84, 360, 'inputs=[…] 2개', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      tx(830, 340, 'outputs=[…] 2개', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      mono(480, 395, 'Total ' + fmt(lerp(0, 332619, E(u, 1.2, 2.3))), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC }); return; }
    // k ≥ 6: compile · fit
    const lossT = [['mse', M4.py], ['sparse_categorical_crossentropy', M4.cy]];
    lossT.forEach(([s, y], i) => mono(M4.hx, y + 50, s, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: i ? WARN : GOOD, opacity: k === 6 ? fade(u, 0.3 + i * 0.4) : 1 }));
    if (k === 6) { snippet(40, 352, ['loss={"price": "mse", "category": "sparse_categorical_crossentropy"}'], { op: fade(u, 1.0), fs: 13.5 }); return; }
    if (k === 7) { const W = [1.0, 0.2];
      tx(40, 372, 'loss =', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.2) });
      [['1.0 × price_loss', GOOD, 1.0], ['0.2 × category_loss', WARN, 0.2]].forEach(([s, col, w], i) => { const x = 110 + i * 300;
        el('rect', { x, y: 384, width: 260 * w * E(u, 0.5 + i * 0.4, 1.4 + i * 0.4), height: 14, rx: 4, fill: col, opacity: 0.7 });
        mono(x, 374, (i ? '+ ' : '') + s, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: fade(u, 0.4 + i * 0.4) }); });
      sub(780, 395, '큰 쪽이 학습을 독점하지 않게', fade(u, 2.0), { 'font-weight': 700, fill: INK }); return; }
    snippet(40, 348, ['model.fit({"image": imgs, "text": toks},', '          {"price": prices, "category": cats}, epochs=5)'], { op: fade(u, 0.3), fs: 13.5 });
    dot([[20, M4.iy], [M4.x[0] - 60, M4.iy]], seg(u, 0.6, 1.4), INFO, 7); dot([[20, M4.ty], [M4.x[0] - 60, M4.ty]], seg(u, 0.6, 1.4), INFO, 7);
    sub(700, 380, '입력·출력 모두 이름으로 짝짓는다', fade(u, 1.6), { 'font-weight': 700, fill: INK }); }

  // ---------- 5. 세 방식 지도 ----------
  const COLX = [165, 480, 795];
  function s5(t, c) { const { k, u } = c;
    const heads = [['Sequential', '일직선 스택', INK], ['함수형 API', 'DAG · 구조가 데이터', ACC], ['서브클래싱', '파이썬 코드로 call', WARN]];
    heads.forEach(([a, b, col], i) => { if (i > Math.min(k, 2) && k < 3) return; const isNew = (k === i) || (i === 2 && k === 3), sc = isNew ? pop(u, 0.2) : 1;
      el('rect', { x: COLX[i] - 145, y: 30, width: 290, height: 300, rx: 12, fill: SOFT, opacity: clamp(sc) });
      tx(COLX[i], 60, a, { 'font-size': 17, 'font-weight': 800, fill: col, 'text-anchor': 'middle', opacity: clamp(sc) }); sub(COLX[i], 82, b, clamp(sc)); });
    // ① Sequential
    layer(COLX[0], 140, 'Dense(32) relu', '(None, 32)', 160, { w: 170, s: k === 0 ? pop(u, 0.5) : 1 }); grow(COLX[0], 174, COLX[0], 196, k === 0 ? E(u, 0.8, 1.0) : 1, MUT);
    layer(COLX[0], 230, 'Dense(1)', '(None, 1)', 33, { w: 170, s: k === 0 ? pop(u, 0.9) : 1 });
    mono(COLX[0], 310, '합계 193', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k === 0 ? fade(u, 1.4) : 1 });
    if (k >= 1) { // ② 함수형: 텐서와 층이 그래프로
      const xs = [COLX[1] - 100, COLX[1], COLX[1] + 100];
      ['inp', 'x', 'out'].forEach((s, i) => { card(xs[i], 150, 64, 34, { rx: 17, text: s, fs: 14.5, mono: true, stroke: INFO, fill: INFOBG, s: k === 1 ? pop(u, 0.3 + i * 0.3) : 1 }); if (i) grow(xs[i - 1] + 34, 150, xs[i] - 34, 150, k === 1 ? E(u, 0.4 + i * 0.3, 0.7 + i * 0.3) : 1, ACC); });
      sub(COLX[1], 196, 'Model(inp, out) · 193', k === 1 ? fade(u, 1.4) : 1, { class: 'mono', 'font-weight': 700, fill: ACC });
      if (k >= 2) { const s = k === 2 ? pop(u, 0.3) : 1; card(COLX[1], 266, 200, 78, { rx: 6, stroke: INK, sw: 2, s, fill: PANEL });
        [0, 1, 2].forEach((i) => el('rect', { x: COLX[1] - 70 + i * 52, y: 252, width: 36, height: 22, rx: 4, fill: 'none', stroke: MUT, 'stroke-width': 1.5, opacity: clamp(s) }));
        mono(COLX[1], 320, 'model.png', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: clamp(s) });
        if (k === 2) sub(COLX[1], 380, '그래프가 데이터라 그림·저장이 된다', fade(u, 1.0), { 'font-weight': 700, fill: INK }); } }
    if (k >= 3) { // ③ 서브클래싱: 그래프는 call 안에 숨는다
      const s = k === 3 ? fade(u, 0.3) : 1;
      ['class MyModel(Model):', '  def call(self, x):', '    return self.d2(', '        self.d1(x))'].forEach((ln, i) => mono(COLX[2] - 128, 130 + i * 24, ln, { 'font-size': 14, fill: i === 1 ? WARN : INK, opacity: s }));
      card(COLX[2], 266, 200, 78, { rx: 6, stroke: OFF, sw: 2, dash: '6 5', s: k === 3 ? pop(u, 1.0) : 1 });
      tx(COLX[2], 274, '?', { 'font-size': 30, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: k === 3 ? fade(u, 1.1) : 1 });
      sub(COLX[2], 360 - 46, '193 · 그래프는 코드 속', k === 3 ? fade(u, 1.5) : 1, { 'font-weight': 700 }); }
    if (k === 3) sub(480, 390, '자유를 얻는 대신 시각화·직렬화를 잃는다', fade(u, 2.0), { 'font-weight': 700, fill: BAD, 'font-size': 15 });
    if (k === 4) [['일직선이면', INK], ['그래프면', ACC], ['그래프로도 안 되면', WARN]].forEach(([s, col], i) => { const sc = pop(u, 0.3 + i * 0.4);
      card(COLX[i], 372, 250, 44, { rx: 22, text: s, fs: 15, stroke: col, color: col, sw: 2.5, s: sc }); });
    if (k === 5) [['nn.Sequential', INK], ['nn.Module + forward 연결', ACC], ['nn.Module 그 자체', WARN]].forEach(([s, col], i) => { const sc = pop(u, 0.3 + i * 0.4);
      card(COLX[i], 372, 270, 44, { rx: 8, text: s, fs: 14, mono: true, stroke: col, s: sc }); }); }

  const quiz = [
    { q: 'Sequential로 이미지와 텍스트를 함께 받는 모델을 만들 수 없는 이유는 무엇인가?',
      o: ['층이 텐서를 하나 받아 하나만 내보내는 일직선 스택이라서', 'Conv2D와 LSTM을 같은 모델에 넣을 수 없어서', '파라미터가 너무 많아져서'], a: 0,
      why: 'Sequential은 입력 1 → 스택 → 출력 1만 표현한다. 다중 입력은 일직선이 아니라 그래프(DAG)다.' },
    { q: 'x = layers.Dense(64)(inputs)에서 Dense(64)는 어떤 역할을 하는가?',
      o: ['inputs의 값을 64로 바꾼다', '텐서를 받아 새 텐서를 돌려주는 함수', 'Model을 만드는 생성자'], a: 1,
      why: '층은 객체이면서 함수다. (None, 4) 텐서를 넣으면 (None, 64) 텐서가 나오고, 이 층에 320개의 가중치가 생긴다.' },
    { q: '모양이 (None, 8)과 (None, 16)인 텐서를 concatenate 하면 결과 모양은 무엇인가?',
      o: ['(None, 16)', '(None, 8)', '(None, 24)'], a: 2,
      why: 'concatenate는 옆으로 이어 붙여 8 + 16 = 24가 된다. add는 모양이 같은 텐서끼리 더해 모양이 그대로다.' },
    { q: '가격(회귀)과 카테고리(분류)를 함께 내는 모델에서 loss_weights를 주는 이유는 무엇인가?',
      o: ['두 손실의 크기가 달라 한쪽이 학습을 독점하지 않게 하려고', '출력 층에 이름을 붙이려고', '입력을 두 개 받으려고'], a: 0,
      why: '총 손실은 1.0 × price_loss + 0.2 × category_loss처럼 더해진다. 스케일이 큰 MSE가 분류를 압도하지 않게 균형을 맞춘다.' },
    { q: '함수형 API가 서브클래싱보다 plot_model과 저장이 쉬운 이유는 무엇인가?',
      o: ['파라미터 수가 더 적어서', '그래프 구조가 데이터로 남아서', 'call 메서드를 쓰지 않아 빨라서'], a: 1,
      why: '함수형은 Model(inputs, outputs)가 층 연결을 그래프로 기록한다. 서브클래싱은 연결이 call 안의 파이썬 코드에 숨는다.' },
  ];

  const summary = [
    'Sequential은 입력 하나, 출력 하나의 일직선 스택만 그린다.',
    '함수형 API는 층을 텐서에 함수처럼 호출하고 Model(inputs, outputs)로 그래프를 묶는다.',
    'add는 같은 모양을 더하고 concatenate는 옆으로 이어 8 + 16이 24가 된다.',
    '출력이 둘이면 loss를 층 이름 딕셔너리로 주고 loss_weights로 균형을 맞춘다.',
  ];
  const review = [
    { q: 'add([h, z])에서 모양이 맞지 않는다는 에러가 났다. h는 (None, 16), z는 (None, 32)다. 먼저 고칠 것은?',
      o: ['z를 만드는 층의 출력 크기를 16으로 맞춘다', 'add를 Model로 바꾼다', 'inputs의 모양을 (None, 32)로 바꾼다'], a: 0,
      why: 'add는 같은 모양끼리 더한다. 크기가 다른 두 특징을 그냥 합치고 싶다면 concatenate를 쓴다.' },
    { q: '두 출력 모델을 compile 했는데 category 손실이 거의 줄지 않고 price만 학습된다. 먼저 손볼 곳은?',
      o: ['입력 Input을 하나로 합친다', 'loss_weights로 두 손실의 균형을 다시 잡는다', 'Embedding 차원을 0으로 줄인다'], a: 1,
      why: '스케일이 큰 손실이 전체를 이끌면 다른 출력은 뒤처진다. loss_weights는 1.0 · 0.2처럼 각 손실의 몫을 정한다.' },
    { q: '층 수가 입력마다 달라지는 연구용 모델을 만들어야 한다. 어느 방식이 맞는가?',
      o: ['Sequential', '함수형 API', '서브클래싱'], a: 2,
      why: '실행 중에 구조가 바뀌는 동적 모델은 그래프로 미리 그릴 수 없다. 이때만 call을 직접 쓰는 서브클래싱을 고른다.' },
  ];

  R.page({ title: '함수형 API로 그래프 그리기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
