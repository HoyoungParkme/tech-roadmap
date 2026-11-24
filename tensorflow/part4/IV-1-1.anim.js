/* IV-1-1 tf.data 파이프라인 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림: 배열 → 원소 스트림 → 변환 체인(파이프) → CPU·GPU 타임라인 → 파일 파이프라인 → 표준 레시피.
 * 숫자: 원소 값·셔플 결과는 venv(tensorflow-cpu 2.21, np.random.seed(0), shuffle seed=0) 실행값,
 *       처리량(100·180·260 img/s)은 페이지의 예시 값(throughput 데이터)이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, cross, check, terminal, hbar, heat } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const X4 = (s) => { try { return JSON.parse(s); } catch (e) { return [0, 0, 0, 0]; } };
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 600, fill: INK, opacity: op ?? 1 }, a || {}));

  // ---------- 원소 카드: [x0 x1 x2 x3 | y] ----------
  function elem(cx, cy, xs, y, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0.01) return;
    const w = o.w || 50, g = 4, W = 4 * w + 3 * g, x0 = -(W + 44) / 2, G0 = R.G(cx, cy, s, o.op);
    xs.forEach((v, i) => { el('rect', { x: x0 + i * (w + g), y: -15, width: w, height: 30, rx: 5, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 1.6 }, G0);
      mono(x0 + i * (w + g) + w / 2, 5, typeof v === 'number' ? v.toFixed(o.dec ?? 2) : String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: o.color || INK }, G0); });
    el('rect', { x: x0 + W + 8, y: -15, width: 36, height: 30, rx: 15, fill: ACCBG, stroke: ACC, 'stroke-width': 1.6 }, G0);
    mono(x0 + W + 26, 5, String(y), { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC }, G0);
    return { left: cx + x0 * s, right: cx - x0 * s, xr: cx + (x0 + W) * s }; }
  // 번호 토큰 (파이프 위를 흐르는 원소)
  function token(x, y, label, o) { o = o || {}; const w = o.w || 40;
    card(x, y, w, 26, { rx: 6, text: String(label), fs: 13.5, mono: true, fw: 700, fill: o.fill || PANEL, stroke: o.stroke || INK, color: o.color || INK, sw: 1.6, op: o.op, s: o.s }); }
  // 파이프 단계 상자
  function stage(cx, cy, name, o) { o = o || {}; const w = o.w || 128, h = o.h || 50, s = o.s ?? 1; if (s <= 0.01) return;
    card(cx, cy, w, h, { rx: 10, fill: o.fill || PANEL, stroke: o.stroke || ACC, sw: o.sw || 2.4, s, op: o.op, text: name, fs: o.fs || 14, mono: true, fw: 700, color: o.color || INK, dash: o.dash }); }

  // =========================================================
  // 1. Dataset 만들기 — 배열의 첫 축을 잘라 원소 스트림으로
  // =========================================================
  const ROWY = (r) => 104 + r * 44;
  const LX = 170, RX = 772;
  const ROWS = [[[0.55, 0.72, 0.60, 0.54], 0], [[0.42, 0.65, 0.44, 0.89], 1], [[0.96, 0.38, 0.79, 0.53], 1], [[0.57, 0.93, 0.07, 0.09], 1]];
  function rowsOf(b) { const e = (b && b.elements) || []; return ROWS.map((r, i) => (e[i] && e[i].x && e[i].x.startsWith('[0.') ? [X4(e[i].x), e[i].y] : r)); }
  function matrix(rows, op, frame) {
    rows.forEach(([xs, y], r) => elem(LX, ROWY(r), xs, y, { op }));
    if (frame > 0) { el('rect', { x: LX - 132, y: ROWY(0) - 22, width: 220, height: ROWY(3) - ROWY(0) + 44 + 36, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2.2, opacity: frame * op });
      el('rect', { x: LX + 92, y: ROWY(0) - 22, width: 42, height: ROWY(3) - ROWY(0) + 44 + 36, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: frame * op }); }
    mono(LX - 22, ROWY(3) + 40, '⋮', { 'font-size': 18, 'text-anchor': 'middle', fill: MUT, opacity: op });
    mono(LX + 113, ROWY(3) + 40, '⋮', { 'font-size': 18, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
  function s1(t, c) { const { k, u } = c, rows = rowsOf(c.beat);
    if (k === 0) {
      tx(LX - 132, 66, 'x · (1000, 4) float32', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.1) });
      tx(LX + 86, 66, 'y · (1000,)', { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: ACC, opacity: fade(u, 0.5) });
      rows.forEach(([xs, y], r) => elem(LX, ROWY(r), xs, y, { s: pop(u, 0.2 + r * 0.25) }));
      if (u > 0.2) { el('rect', { x: LX - 132, y: ROWY(0) - 22, width: 220, height: ROWY(3) - ROWY(0) + 80, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2.2, opacity: fade(u, 1.3) });
        el('rect', { x: LX + 92, y: ROWY(0) - 22, width: 42, height: ROWY(3) - ROWY(0) + 80, rx: 8, fill: 'none', stroke: ACC, 'stroke-width': 2.2, opacity: fade(u, 1.3) }); }
      mono(LX - 22, ROWY(3) + 40, '⋮', { 'font-size': 18, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      sub(LX, ROWY(3) + 86, '1000행이 메모리에 통째로', fade(u, 1.5), { 'font-weight': 700, fill: INK });
      // 오른쪽: 아직 비어 있는 스트림 자리
      el('rect', { x: RX - 150, y: ROWY(0) - 26, width: 300, height: 4 * 44 + 10, rx: 12, fill: 'none', stroke: GRID, 'stroke-width': 2, 'stroke-dasharray': '6 6', opacity: fade(u, 1.8) });
      sub(RX, ROWY(1) + 26, '아직 스트림이 아니다', fade(u, 1.9));
      return; }
    // k ≥ 1 : 스트림
    tx(LX - 132, 66, 'x, y 배열', { 'font-size': 15, 'font-weight': 700, fill: MUT });
    const cut = k === 1 ? E(u, 0.1, 0.8) : 1;
    if (k <= 3) { const gop = k === 1 ? lerp(1, 0.35, E(u, 0.6, 1.4)) : 0.35;
      rows.forEach(([xs, y], r) => { const f = k === 1 ? E(u, 0.8 + r * 0.25, 1.6 + r * 0.25) : 1; if (f <= 0 || f >= 1) elem(LX, ROWY(r), xs, y, { op: f <= 0 ? 1 : gop }); });
      matrix([], gop, 1); }
    if (k <= 3) for (let r = 0; r < 4; r++) { const y = ROWY(r) + 22; if (r < 3) el('line', { x1: LX - 140, y1: y, x2: lerp(LX - 140, LX + 142, cut), y2: y, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 4', opacity: k === 1 ? 1 : 0.4 }); }
    if (k === 1) pill(470, 58, 'from_tensor_slices((x, y))', ACC, pop(u, 0.1), { mono: true, fs: 14 });
    else pill(470, 58, 'ds', ACC, 1, { mono: true, fs: 15 });
    tx(RX - 150, 66, '원소 스트림', { 'font-size': 15, 'font-weight': 700, fill: ACC });
    rows.forEach(([xs, y], r) => { const f = k === 1 ? E(u, 0.8 + r * 0.25, 1.6 + r * 0.25) : 1; if (f <= 0) return;
      elem(lerp(LX, RX, f), ROWY(r), xs, y, { stroke: f >= 1 ? ACC : INK }); if (f >= 1) mono(RX - 156, ROWY(r) + 5, String(r), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); });
    const cnt = k === 1 ? Math.round(lerp(0, 1000, E(u, 0.9, 2.4))) : 1000;
    mono(RX, ROWY(3) + 44, '⋮', { 'font-size': 18, 'text-anchor': 'middle', fill: MUT });
    tx(RX, ROWY(3) + 74, `원소 ${cnt.toLocaleString('en-US')}개`, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, class: 'mono' });
    if (k === 2) { const f = E(u, 0.2, 1.0), cx = 470, cy = 312;
      el('path', { d: `M${RX - 150},${ROWY(0)} C${RX - 230},${ROWY(0)} ${cx + 40},${cy - 90} ${cx},${cy - 30}`, fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: f });
      elem(cx, cy, rows[0][0], rows[0][1], { s: 1.15 * pop(u, 0.5), stroke: ACC });
      const bx0 = cx - 152, bx1 = cx + 60, by = cy + 26;
      el('path', { d: `M${bx0},${by} V${by + 8} H${bx1} V${by}`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.1) });
      el('path', { d: `M${cx + 76},${by} V${by + 8} H${cx + 116} V${by}`, fill: 'none', stroke: ACC, 'stroke-width': 2, opacity: fade(u, 1.4) });
      mono((bx0 + bx1) / 2, by + 30, 'shape (4,) · float32', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(cx + 120, by + 30, 'shape ()', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.5) });
      tx(cx, cy - 46, 'ds.element_spec', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', class: 'mono', opacity: fade(u, 0.4) }); }
    if (k === 3) { const f = E(u, 0.2, 0.8);
      el('rect', { x: RX - 168, y: ROWY(0) - 24, width: 336, height: lerp(10, 3 * 44 + 4, f), rx: 10, fill: 'none', stroke: WARN, 'stroke-width': 3 });
      pill(RX + 110, 62, 'take(3)', WARN, pop(u, 0.5), { mono: true });
      const lines = ['>>> for feat, label in ds.take(3):', '[0.5488135  0.71518934 0.60276335 0.5448832 ] → 0', '[0.4236548  0.6458941  0.4375872  0.891773  ] → 1', '[0.96366274 0.3834415  0.79172504 0.5288949 ] → 1'];
      terminal(40, 286, 500, 124, lines, lerp(1, 4, E(u, 0.7, 2.4)), { fs: 13.5, lh: 21, title: 'print' });
      sub(RX, ROWY(3) + 100, '스트림은 그대로 1000개', fade(u, 2.2), { 'font-weight': 700, fill: INK }); }
    if (k === 4) { const map = (c.beat.mapping || []).slice(0, 4);
      el('rect', { x: 20, y: 88, width: 590, height: 210, rx: 12, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 0.1) });
      tx(40, 118, 'tf.data', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) });
      tx(330, 118, 'PyTorch', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.2) });
      map.forEach((m, i) => { const y = 154 + i * 38, f = fade(u, 0.4 + i * 0.4);
        mono(40, y, m.tf, { 'font-size': 13.5, opacity: f, fill: INK });
        mono(316, y, '≈', { 'font-size': 14, fill: MUT, opacity: f, 'text-anchor': 'middle' });
        mono(330, y, m.pt, { 'font-size': 13.5, opacity: fade(u, 0.6 + i * 0.4), fill: INFO }); });
      sub(315, 340, 'Dataset 하나가 TensorDataset 과 DataLoader 의 일을 함께 한다', fade(u, 2.0), { 'font-weight': 700, fill: INK }); } }

  // =========================================================
  // 2. 변환 체인 — 토큰이 파이프를 따라 흐른다
  // =========================================================
  const PY = 236, STX = { src: 86, map: 262, shuf: 448, batch: 640, rep: 840 };
  const SHUF = [732, 776, 542, 686, 401, 426, 431, 586, 409, 16, 285, 851];   // shuffle(1000, seed=0) 의 첫 배치 앞부분 (실행값)
  function conveyor(t, x0, x1, labelAt, styleAt, hide) { const gap = 48, off = (t * 34) % gap;
    for (let x = x1 - off; x > x0; x -= gap) { const n = Math.round((x1 - off - x) / gap); if (hide && hide(x)) continue; token(x, PY, labelAt(x, n), styleAt(x)); } }
  const behind = (xs, half) => (x) => xs.some((c) => Math.abs(x - c) < half);
  function pipeBase(op) { el('rect', { x: 30, y: PY - 20, width: 900, height: 40, rx: 20, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: op ?? 1 }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) {
      const xin = [0.55, 0.72, 0.60, 0.54], xout = [0.0022, 0.0028, 0.0024, 0.0021];
      elem(190, 130, xin, 0, { w: 58, s: pop(u, 0.1) });
      card(480, 130, 190, 64, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.5) });
      mono(480, 124, 'scale(x, y)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.6) });
      mono(480, 146, 'x / 255.0', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      grow(332, 130, 380, 130, E(u, 0.8, 1.2), ACC); grow(580, 130, 640, 130, E(u, 1.4, 1.8), ACC);
      fly(330, 100, 470, 100, seg(u, 0.8, 1.4), 'x', { mono: true });
      elem(790, 130, xout, 0, { w: 58, dec: 4, s: pop(u, 1.8), stroke: ACC });
      sub(790, 172, '원소 하나 → 원소 하나', fade(u, 2.1), { 'font-weight': 700, fill: INK });
      pipeBase(0.5 * fade(u, 2.0)); stage(STX.map, PY, 'map(scale)', { s: 1, op: 0.5 * fade(u, 2.0), dash: '5 4', stroke: ACC });
      sub(480, 300, '아직 정의만 했다. Dataset 에는 붙지 않았다', fade(u, 2.2));
      return; }
    if (k >= 4) return s2chart(t, c);
    pipeBase(1);
    const hasShuf = k >= 2, hasBatch = k >= 3;
    // 토큰: 원래 순서(0,1,2…) → map 뒤 채움 → shuffle 뒤 섞인 번호
    const endX = hasBatch ? STX.batch - 70 : 920;
    if (k <= 3) conveyor(t, 140, endX, (x, n) => (hasShuf && x > STX.shuf + 50 ? SHUF[n % SHUF.length] : n % 1000),
      (x) => ({ fill: x > STX.map + 64 ? ACCBG : PANEL, stroke: x > STX.map + 64 ? ACC : MUT, w: hasShuf && x > STX.shuf + 50 ? 44 : 40 }),
      behind([STX.src + 12, STX.map].concat(hasShuf ? [STX.shuf] : []), 88));
    stage(STX.src, PY, 'from_tensor_slices', { w: 150, fs: 13.5, stroke: INK });
    stage(STX.map, PY, 'map(scale)', { s: k === 1 ? pop(u, 0.2) : 1 });
    if (hasShuf) { stage(STX.shuf, PY, k >= 4 ? 'shuffle(buf)' : 'shuffle(1000)', { s: k === 2 ? pop(u, 0.2) : 1, stroke: WARN, fill: WARNBG });
      if (k === 2) { // 버퍼 그림: 칸 10개 중 하나가 뽑혀 나간다
        const bx = STX.shuf - 100, by = 92; el('rect', { x: bx, y: by, width: 200, height: 70, rx: 10, fill: PANEL, stroke: WARN, 'stroke-width': 2, opacity: fade(u, 0.5) });
        tx(bx + 8, by - 8, '버퍼 1000칸 (일부만 그림)', { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
        const pick = Math.floor(t * 1.6) % 10;
        for (let i = 0; i < 10; i++) { const cx = bx + 22 + (i % 5) * 39, cy = by + 20 + Math.floor(i / 5) * 30; card(cx, cy, 32, 22, { rx: 5, sw: 1.4, stroke: i === pick ? WARN : GRID, fill: i === pick ? WARNBG : PANEL, op: fade(u, 0.6 + i * 0.05) }); }
        grow(STX.shuf, by + 72, STX.shuf, PY - 28, E(u, 1.0, 1.5), WARN);
        sub(STX.shuf + 150, 140, '무작위로 하나씩', fade(u, 1.3), { fill: WARN, 'font-weight': 700 }); } }
    if (k === 1) sub(600, 300, '원소가 map 을 지나며 x/255 로 바뀐다', fade(u, 0.8), { 'font-size': 14.5 });
    if (k === 2) sub(600, 300, '번호가 섞여 나온다 (shuffle seed=0 실행값)', fade(u, 1.8), { 'font-size': 14.5 });
    if (hasBatch && k <= 3) { stage(STX.batch, PY, 'batch(32)', { s: k === 3 ? pop(u, 0.2) : 1, stroke: GOOD, fill: GOODBG });
      stage(STX.rep, PY, 'repeat()', { s: k === 3 ? pop(u, 0.5) : 1, stroke: INFO, fill: INFOBG });
      // 배치 덩어리 (32, 4)
      const f = E(u, 0.6, 1.4), bxx = lerp(STX.batch + 60, 740, f);
      for (let r = 0; r < 4; r++) for (let q = 0; q < 8; q++) el('rect', { x: bxx + q * 9 - 30, y: 116 + r * 9, width: 7, height: 7, rx: 1.5, fill: GOOD, opacity: fade(u, 0.6 + (r * 8 + q) * 0.02) });
      mono(bxx + 6, 172, '(32, 4) + (32,)', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.2) });
      // repeat 고리
      const g = E(u, 1.2, 2.2); if (g > 0) el('path', { d: `M${STX.rep},${PY + 26} V${PY + 70} H${lerp(STX.rep, STX.src, g)}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, 'stroke-dasharray': '6 4', 'marker-end': g > 0.98 ? 'url(#ra-ah)' : null });
      sub(470, PY + 94, '한 바퀴 = 32배치 (마지막 배치 8개) · repeat() 뒤 cardinality = -1 (끝없음)', fade(u, 1.8), { 'font-weight': 700, fill: INFO }); }
  }
  function s2chart(t, c) { const { k, u } = c;
    if (k === 4) { // 정렬 데이터 + 버퍼 크기별 첫 배치 라벨 구성 (실행값)
      const x0 = 150, W = 520, X = (i) => x0 + (i / 1000) * W;
      tx(x0, 44, '라벨 순으로 정렬된 1000개 (0 → 333 → 666 → 999)', { 'font-size': 15, 'font-weight': 700 });
      [[0, 334, INFO], [334, 667, WARN], [667, 1000, GOOD]].forEach(([a, z, col], i) => el('rect', { x: X(a), y: 56, width: (X(z) - X(a)) * E(u, 0.1 + i * 0.15, 0.5 + i * 0.15), height: 18, fill: col, opacity: 0.8 }));
      const BUF = [[10, [32, 0, 0], [0, 38]], [100, [32, 0, 0], [6, 120]], [1000, [7, 11, 14], [16, 985]]];
      tx(x0 + W + 40, 112, '첫 배치 32개의 라벨', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.4) });
      BUF.forEach(([buf, cnt, rng], i) => { const y = 140 + i * 88, f = fade(u, 0.5 + i * 0.6);
        mono(x0 - 12, y + 14, `shuffle(${buf})`, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', opacity: f });
        el('rect', { x: x0, y: y + 4, width: W, height: 14, rx: 3, fill: SOFT, opacity: f });
        el('rect', { x: x0, y: y, width: Math.max(4, (buf / 1000) * W), height: 22, rx: 3, fill: 'none', stroke: INK, 'stroke-width': 2.2, opacity: f });
        el('rect', { x: X(rng[0]), y: y + 4, width: Math.max(3, X(rng[1]) - X(rng[0])), height: 14, rx: 2, fill: ACC, opacity: 0.85 * f });
        mono(x0, y + 42, `첫 배치 번호 ${rng[0]}~${rng[1]}`, { 'font-size': 13.5, fill: MUT, opacity: f });
        let xx = x0 + W + 40; const tot = 32, bw = 200;
        cnt.forEach((n, j) => { if (!n) return; const w = (n / tot) * bw * E(u, 0.7 + i * 0.6, 1.3 + i * 0.6);
          el('rect', { x: xx, y: y, width: w, height: 22, fill: [INFO, WARN, GOOD][j], opacity: 0.85 });
          if (w > 26) mono(xx + w / 2, y + 16, String(n), { 'font-size': 13.5, 'font-weight': 800, 'text-anchor': 'middle', fill: PANEL }); xx += w; });
        if (cnt[0] === 32) mono(x0 + W + 40, y + 42, '32개 전부 라벨 0', { 'font-size': 14, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2 + i * 0.6) }); });
      sub(480, 408, '실행값 · range(1000), seed=0', fade(u, 2.2)); return; }
    if (k === 5) {
      const x0 = 110, W = 740, X = (i) => x0 + (i / 999) * W;
      const A = [16, 19, 23, 33, 90, 229, 285, 401, 409, 425, 426, 431, 512, 524, 542, 586, 633, 646, 682, 686, 714, 732, 775, 776, 816, 851, 871, 880, 930, 942, 965, 985];
      [[90, 'shuffle(1000) → batch(32)', GOOD, A], [250, 'batch(32) → shuffle(1000)', BAD, Array.from({ length: 32 }, (_, i) => 384 + i)]].forEach(([y, name, col, ids], r) => {
        const f = fade(u, 0.2 + r * 1.0);
        mono(x0, y - 22, name, { 'font-size': 15, 'font-weight': 800, fill: col, opacity: f });
        el('line', { x1: x0, y1: y + 20, x2: x0 + W, y2: y + 20, stroke: MUT, 'stroke-width': 1.6, opacity: f });
        [0, 250, 500, 750, 999].forEach((v) => mono(X(v), y + 40, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: f }));
        ids.forEach((v, i) => { const s = clamp((u - 0.4 - r * 1.0) * 24 - i * 0.6); if (s <= 0) return; el('rect', { x: X(v) - 2, y: y, width: 4, height: 18 * s, fill: col }); }); });
      tx(x0, 158, '첫 배치 32개가 전체에 흩어진다 · epoch 마다 구성이 바뀐다', { 'font-size': 14.5, opacity: fade(u, 1.0) }); check(x0 + W + 30, 110, 12, pop(u, 0.9));
      tx(x0, 318, '첫 배치 = 384~415 연속 덩어리 · 덩어리 안은 늘 같다', { 'font-size': 14.5, opacity: fade(u, 2.0) }); cross(x0 + W + 30, 270, 12, pop(u, 1.9));
      sub(480, 395, '실행값 · range(1000), seed=0', fade(u, 2.2)); return; } }

  // =========================================================
  // 3. prefetch 와 병렬 map — CPU·GPU 타임라인
  // =========================================================
  const BW = 112, TX0 = 140;
  const KIND = { prep: ['준비', INFOBG, INFO, INK], train: ['학습', ACC, ACC, PANEL], idle: ['쉼', 'none', GRID, MUT], wait: ['대기', WARNBG, WARN, INK] };
  function trow(y, who, blocks, reveal, o) { o = o || {};
    mono(TX0 - 12, y + 20, who, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'end', fill: MUT, opacity: o.op ?? 1 });
    blocks.forEach((b, i) => { const x = TX0 + i * BW, f = clamp(reveal * blocks.length - i); if (f <= 0) return; const [name, fill, stroke, col] = KIND[b] || KIND.idle;
      const w = (BW - 6) * f;
      el('rect', { x, y, width: w, height: 30, rx: 5, fill, stroke, 'stroke-width': b === 'idle' ? 1.6 : 2, 'stroke-dasharray': b === 'idle' ? '4 4' : null, opacity: o.op ?? 1 });
      if (o.lanes && b === 'prep') for (let l = 1; l < 4; l++) el('line', { x1: x + 4, y1: y + l * 7.5, x2: x + w - 4, y2: y + l * 7.5, stroke: INFO, 'stroke-width': 1.2, opacity: 0.7 * (o.op ?? 1) });
      if (f > 0.8) tx(x + (BW - 6) / 2, y + 20, name, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: col, opacity: o.op ?? 1 }); }); }
  const busy = (bl) => bl.filter((x) => x === 'train').length;
  function s3(t, c) { const { k, u } = c, b = c.beat, p = c.prev || {};
    const No = b.timelineNo || [], Yes = b.timelineYes || [];
    tx(TX0, 46, '직렬 · map(heavy_map).batch(32)', { 'font-size': 15, 'font-weight': 700, class: 'mono' });
    const r0 = k <= 2 && k !== 1 ? E(u, 0.2, 1.8) : 1;
    trow(58, 'CPU', No[0] ? No[0].blocks : [], r0); trow(96, 'GPU', No[1] ? No[1].blocks : [], r0);
    if (No[1]) mono(TX0 + 6 * BW + 4, 116, `학습 칸 ${busy(No[1].blocks)}/6`, { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
    if (k === 0) { pill(480, 190, 'AUTOTUNE = tf.data.AUTOTUNE', ACC, pop(u, 0.6), { mono: true, fs: 15 });
      mono(480, 232, '값은 -1 · "숫자는 런타임이 정한다" 는 표식', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) }); }
    if (k === 1) { ['flip', 'resize 224²', '÷255'].forEach((s, i) => pill(TX0 + 56 + i * 2 * BW, 160, s, INFO, pop(u, 0.3 + i * 0.3), { mono: true, fs: 13.5 }));
      [0, 2, 4].forEach((i) => el('rect', { x: TX0 + i * BW - 3, y: 55, width: BW, height: 36, rx: 7, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.0) }));
      sub(480, 214, '준비가 무거울수록 GPU 의 "쉼" 칸이 길어진다', fade(u, 1.4), { 'font-weight': 700, fill: INK }); }
    if (k === 2) { const ph = TX0 + E(u, 0.2, 2.4) * 6 * BW; el('line', { x1: ph, y1: 50, x2: ph, y2: 134, stroke: INK, 'stroke-width': 2 });
      banner(480, 196, 'GPU 사용률 50% 언저리 · 절반이 논다', pop(u, 1.6)); }
    if (k >= 3) { const title = k === 3 ? '병렬 map · map(…, num_parallel_calls=AUTOTUNE)' : '병렬 map + prefetch(AUTOTUNE)';
      tx(TX0, 188, title, { 'font-size': 15, 'font-weight': 700, class: 'mono', fill: GOOD, opacity: k === 3 ? fade(u, 0.1) : 1 });
      const ry = k === 3 || (p.timelineYes && JSON.stringify(p.timelineYes) !== JSON.stringify(Yes)) ? E(u, 0.3, 1.9) : 1;
      trow(200, 'CPU', Yes[0] ? Yes[0].blocks : [], ry, { lanes: true }); trow(238, 'GPU', Yes[1] ? Yes[1].blocks : [], ry);
      if (Yes[1]) mono(TX0 + 6 * BW + 4, 258, `학습 칸 ${busy(Yes[1].blocks)}/6`, { 'font-size': 14, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) });
      if (k >= 4) for (let i = 0; i < 5; i++) { const g = k === 4 ? E(u, 1.0 + i * 0.2, 1.4 + i * 0.2) : 1; grow(TX0 + i * BW + BW - 10, 232, TX0 + (i + 1) * BW + 14, 240, g, GOOD, { sw: 2 }); }
      if (k === 5) { el('path', { d: `M${TX0},${196} V${190} H${TX0 + BW - 6} V${196}`, fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: fade(u, 0.2) });
        mono(TX0, 300, '배치 안 · num_parallel_calls', { 'font-size': 14.5, 'font-weight': 700, fill: INFO, opacity: fade(u, 0.3) });
        mono(TX0 + 2, 322, '한 배치의 원소를 여러 코어가 나눠 준비 (줄무늬)', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.5) });
        mono(540, 300, '배치 사이 · prefetch', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
        mono(540, 322, 'GPU 가 i 번째를 학습할 때 CPU 는 i+1 번째', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 1.2) }); } }
    // 처리량 (예시 값)
    const tp = b.throughput || {}, pt = p.throughput || {}, num = (s) => parseFloat(s) || 0;
    if (k !== 5) { const a = num(tp.before), z = tween(pt.after ? num(pt.after) : a, num(tp.after), u);
      const y = k >= 3 ? 300 : 260, op = k >= 3 || k === 2 ? 1 : 0.5;
      tx(TX0, y, '처리량 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: op });
      hbar(TX0, y + 12, 420, a, 260, { h: 20, col: OFF, text: `${a} img/s · 직렬`, u: 1 });
      hbar(TX0, y + 42, 420, z, 260, { h: 20, col: z > a + 1 ? GOOD : OFF, text: `${Math.round(z)} img/s${k >= 3 ? ' · ' + (tp.gain || '') : ''}` });
      if (k === 6) pill(780, y + 34, 'model.fit(fast, epochs=10)', GOOD, pop(u, 0.4), { mono: true, fs: 14 }); } }

  // =========================================================
  // 4. 파일 파이프라인 — 경로 → 바이트 → 픽셀, 그리고 cache
  // =========================================================
  const PIX = [[3, 5, 6, 4], [5, 8, 9, 6], [4, 7, 8, 5], [2, 4, 5, 3]];
  function jpg(cx, cy, name, s, o) { o = o || {}; if (s <= 0.01) return; const g = R.G(cx, cy, s, o.op);
    el('path', { d: 'M-20,-26 H10 L22,-14 V26 H-20 Z', fill: PANEL, stroke: o.stroke || INK, 'stroke-width': 2 }, g); el('path', { d: 'M10,-26 V-14 H22', fill: 'none', stroke: o.stroke || INK, 'stroke-width': 2 }, g);
    mono(1, 6, 'jpg', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }, g); if (name) mono(0, 46, name, { 'font-size': 13.5, 'text-anchor': 'middle' }, g); }
  function pixels(x, y, cs, op) { heat(x, y, PIX, cs, { max: 9, fmt: () => '', col: INFO }); if (op != null && op < 1) el('rect', { x, y, width: cs * 4, height: cs * 4, fill: PANEL, opacity: 1 - op }); }
  function folder(x, y, op) { el('path', { d: `M${x},${y} h40 l8,10 h70 v84 h-118 Z`, fill: WARNBG, stroke: WARN, 'stroke-width': 2, opacity: op });
    mono(x + 59, y + 40, 'imgs/', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
    mono(x + 59, y + 62, 'cat/ dog/', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { const Y = 150;
      jpg(80, Y, 'cat/001.jpg', pop(u, 0.1));
      grow(110, Y, 200, Y, E(u, 0.4, 0.8), MUT); mono(155, Y - 14, 'read_file', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.5) });
      card(290, Y, 160, 40, { rx: 8, text: "b'\\xff\\xd8\\xff…'", fs: 13.5, mono: true, s: pop(u, 0.8), stroke: INK });
      sub(290, Y + 40, 'JPEG 압축 바이트', fade(u, 0.9));
      grow(372, Y, 450, Y, E(u, 1.1, 1.5), MUT); mono(411, Y - 14, 'decode_jpeg', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.2) });
      if (u > 1.4) pixels(462, Y - 44, 22, fade(u, 1.5)); sub(506, Y + 66, '(H, W, 3) uint8', fade(u, 1.7));
      grow(560, Y, 640, Y, E(u, 1.8, 2.2), MUT); mono(600, Y - 14, 'resize', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.9) });
      if (u > 2.1) pixels(652, Y - 56, 28, fade(u, 2.2)); sub(708, Y + 76, '(224, 224, 3) · ÷255 → 0~1', fade(u, 2.3), { fill: INK, 'font-weight': 700 });
      sub(480, 300, '셋 다 map 안에서 원소마다 일어난다 · 디코딩이 가장 무겁다', fade(u, 2.4), { 'font-size': 14.5 });
      return; }
    if (k === 1 || k === 2) { folder(40, 70, 1);
      const paths = ['imgs/dog/017.jpg', 'imgs/cat/204.jpg', 'imgs/dog/088.jpg', 'imgs/cat/031.jpg'];
      stage(270, 230, 'list_files', { w: 120, stroke: WARN, fill: WARNBG });
      grow(110, 160, 230, 205, k === 1 ? E(u, 0.2, 0.7) : 1, WARN);
      if (k === 1) { for (let i = 0; i < 3; i++) { const f = ((t * 0.3 + i / 3) % 1); fly(400, 230, 880, 230, f, paths[i], { fill: WARN, color: INK, mono: true, stay: false }); }
        sub(620, 290, '경로 문자열만 흐른다 · 픽셀은 아직 0', fade(u, 0.8), { 'font-weight': 700, fill: INK });
        sub(620, 316, 'list_files 는 기본으로 경로 순서도 섞는다 (shuffle=True)', fade(u, 1.4));
        return; }
      stage(470, 230, 'map(load_image)', { w: 160, s: pop(u, 0.1) });
      pill(470, 180, 'num_parallel_calls=AUTOTUNE', ACC, pop(u, 0.4), { mono: true, fs: 13.5 });
      for (let l = 0; l < 4; l++) { const y = 120 + l * 64 + 30, f = (t * 0.45 + l * 0.27) % 1, x = lerp(560, 860, f);
        el('line', { x1: 556, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 1.5, 'stroke-dasharray': '4 5', opacity: fade(u, 0.3) });
        mono(556, y - 10, `코어 ${l + 1}`, { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.3) });
        if (f < 0.5) mono(x, y + 5, paths[l].slice(5), { 'font-size': 13.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 0.5) });
        else heat(x - 10, y - 12, [[5, 8], [7, 4]], 12, { max: 9, fmt: () => '', col: INFO }); }
      sub(470, 300, '디스크 I/O·디코딩이 병목 · 여기는 병렬이 필수', fade(u, 1.2), { 'font-weight': 700, fill: BAD });
      return; }
    if (k === 3) { const rows = [[110, 'epoch 1', false], [270, 'epoch 2~', true]];
      el('ellipse', { cx: 760, cy: 190, rx: 60, ry: 16, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5 });
      el('path', { d: 'M700,190 V250 A60,16 0 0 0 820,250 V190', fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5 });
      mono(760, 236, 'cache()', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      rows.forEach(([y, name, skip], r) => { const f = fade(u, 0.1 + r * 1.0);
        mono(40, y + 5, name, { 'font-size': 15, 'font-weight': 800, opacity: f });
        ['read', 'decode', 'resize'].forEach((s, i) => { const x = 200 + i * 130;
          stage(x, y, s, { w: 110, h: 40, op: skip ? 0.35 * f : f, stroke: skip ? GRID : INFO, fill: skip ? PANEL : INFOBG });
          if (skip && u > 1.4 + i * 0.2) cross(x, y, 12, pop(u, 1.4 + i * 0.2)); });
        if (!skip) { grow(462, y, 705, 186, E(u, 0.9, 1.4), INFO); dot([[140, y], [462, y], [705, 186]], seg(u, 0.4, 1.4), INFO, 7);
          sub(330, y + 40, '디스크에서 읽고 디코딩 · 느림', f); mono(600, 132, '첫 바퀴 결과를 저장', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, opacity: fade(u, 1.2) }); }
        else { grow(760, 268, 760, y - 4, E(u, 1.5, 1.8), GOOD); grow(770, y, 880, y, E(u, 1.8, 2.1), GOOD); dot([[760, 262], [760, y], [880, y]], seg(u, 1.6, 2.5), GOOD, 7);
          mono(890, y + 5, '학습', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 2.0) });
          sub(330, y + 40, '캐시에서 바로 · 디코딩 건너뜀', fade(u, 1.7), { fill: GOOD, 'font-weight': 700 }); } });
      return; }
    if (k === 4) { const S = [['list_files', WARN], ['map(load)', ACC], ['cache()', GOOD], ['batch(32)', GOOD], ['prefetch', INFO]];
      el('rect', { x: 30, y: 180, width: 900, height: 40, rx: 20, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
      for (let i = 0; i < 8; i++) { const f = (t * 0.25 + i / 8) % 1; el('circle', { cx: lerp(40, 920, f), cy: 200, r: 6, fill: f > 0.36 ? ACC : WARN }); }
      S.forEach(([n, col], i) => stage(110 + i * 180, 200, n, { w: 140, stroke: col, s: i >= 3 ? pop(u, 0.2 + (i - 3) * 0.35) : 1, fill: PANEL }));
      card(820, 320, 140, 52, { rx: 10, text: 'GPU', fs: 16, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.9) }); grow(830, 224, 822, 290, E(u, 1.0, 1.5), ACC);
      sub(400, 300, '메모리 배열일 때와 같은 끝 · batch 뒤에 prefetch', fade(u, 1.3), { 'font-size': 14.5, 'font-weight': 700, fill: INK });
      return; }
    if (k === 5) { // image_dataset_from_directory
      const tree = [['imgs/', 0], ['cat/', 1], ['001.jpg …', 2], ['dog/', 1], ['001.jpg …', 2]];
      tree.forEach(([n, d], i) => mono(50 + d * 24, 90 + i * 30, n, { 'font-size': 14.5, 'font-weight': d < 2 ? 700 : 400, fill: d === 1 ? WARN : INK, opacity: fade(u, 0.1 + i * 0.1) }));
      card(400, 150, 300, 56, { rx: 12, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 0.6), text: 'image_dataset_from_directory', fs: 14.5, mono: true, color: ACC });
      grow(170, 150, 248, 150, E(u, 0.6, 1.0), ACC);
      [['cat', 0], ['dog', 1]].forEach(([n, l], i) => { const y = 250 + i * 46, f = fade(u, 1.0 + i * 0.3);
        mono(300, y, `폴더 ${n}/`, { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: f, 'text-anchor': 'end' }); grow(312, y - 5, 372, y - 5, E(u, 1.0 + i * 0.3, 1.4 + i * 0.3), MUT); mono(384, y, `라벨 ${l}`, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: f }); });
      sub(400, 352, 'class_names 는 폴더 이름의 사전순', fade(u, 1.6));
      grow(552, 150, 640, 150, E(u, 1.6, 2.0), ACC);
      mono(660, 140, '이미지 (32, 224, 224, 3)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 1.9) });
      mono(660, 166, '라벨   (32,)', { 'font-size': 14.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
      mono(660, 206, '값은 0~255 그대로 (나누기 없음)', { 'font-size': 13.5, fill: WARN, opacity: fade(u, 2.2) });
      return; }
    // k6: cache 자리 세 가지
    const R3 = [[90, [['map(load)', ACC], ['cache()', GOOD]], [['cache()', GOOD], ['map(load)', ACC]], '캐시할 게 경로뿐'],
      [210, [['cache()', GOOD], ['랜덤 증강', WARN]], [['랜덤 증강', WARN], ['cache()', GOOD]], '매 epoch 같은 증강'],
    ];
    R3.forEach(([y, good, bad, why], r) => { const f = fade(u, 0.2 + r * 0.8);
      good.forEach(([n, col], i) => stage(110 + i * 150, y, n, { w: 130, h: 42, stroke: col, op: f, fs: 13.5 })); grow(176, y, 184, y, f, MUT); check(345, y, 12, pop(u, 0.4 + r * 0.8));
      bad.forEach(([n, col], i) => stage(530 + i * 150, y, n, { w: 130, h: 42, stroke: col, op: f, fs: 13.5 })); cross(765, y, 12, pop(u, 0.6 + r * 0.8));
      mono(790, y + 5, why, { 'font-size': 14, fill: BAD, 'font-weight': 700, opacity: fade(u, 0.7 + r * 0.8) }); });
    const f3 = fade(u, 1.8); stage(180, 330, 'cache("cache.tf")', { w: 200, h: 44, stroke: INFO, op: f3, fs: 14 });
    mono(300, 335, '데이터가 메모리보다 크면 디스크에 캐시', { 'font-size': 14.5, opacity: f3 }); }

  // =========================================================
  // 5. 표준 레시피 — shuffle → map → batch → prefetch, 두 방식에 꽂기
  // =========================================================
  const SL = [190, 400, 610, 820], PY5 = 104, NAMES = ['shuffle(10000)', 'map(preprocess)', 'batch(32)', 'prefetch'], COLS = [WARN, ACC, GOOD, INFO];
  function recipePipe(t, nOn, u, k) {
    el('rect', { x: 30, y: PY5 - 20, width: 900, height: 40, rx: 20, fill: SOFT, stroke: GRID, 'stroke-width': 1.5 });
    // 토큰: 섞기 전 0,1,2… / 섞인 뒤 번호 / map 뒤 채움 / batch 뒤 덩어리
    const gap = 46, off = (t * 30) % gap;
    for (let x = 900 - off; x > 60; x -= gap) { const n = Math.round((900 - off - x) / gap);
      if (nOn >= 3 && x > SL[2] + 60) continue; if (SL.some((c) => Math.abs(x - c) < 90)) continue;
      const shuf = nOn >= 1 && x > SL[0] + 60, mapped = nOn >= 2 && x > SL[1] + 60;
      token(x, PY5, shuf ? SHUF[n % SHUF.length] : n, { w: shuf ? 44 : 40, fill: mapped ? ACCBG : PANEL, stroke: mapped ? ACC : MUT }); }
    if (nOn >= 3) { const bx = (SL[2] + 70 + ((t * 30) % 180)); for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) el('rect', { x: Math.min(bx, 880) + q * 8, y: PY5 - 12 + r * 8, width: 6, height: 6, rx: 1, fill: GOOD }); }
    SL.forEach((x, i) => { const on = i < nOn, s = on ? (i === nOn - 1 && k <= 2 ? pop(u, 0.2 + (k === 2 && i === 3 ? 0.4 : 0)) : 1) : 1;
      if (!on) stage(x, PY5, '?', { w: 136, dash: '5 4', stroke: GRID, color: MUT });
      else stage(x, PY5, NAMES[i], { w: 136, stroke: COLS[i], s: Math.max(0.3, s), fs: 13.5 });
      card(x, PY5 - 46, 26, 26, { rx: 13, text: String(i + 1), fs: 14, fw: 800, fill: on ? COLS[i] : PANEL, stroke: on ? COLS[i] : GRID, color: on ? PANEL : MUT }); }); }
  function s5(t, c) { const { k, u } = c, b = c.beat;
    const nOn = k === 0 ? 1 : k === 1 ? 2 : 4;
    recipePipe(t, nOn, u, k);
    const rec = b.recipe || [];
    if (k <= 2) { const r = rec.slice(k === 2 ? 2 : k), y0 = 196;
      r.forEach((x, i) => { mono(SL[k] - 70, y0 + i * 26, `${x.step} · ${x.why}`, { 'font-size': 14.5, opacity: fade(u, 0.6 + i * 0.3), fill: INK }); });
      if (k < 2) { const L = ['ds = (tf.data.Dataset.from_tensor_slices((x, y))', '      .shuffle(10000)', '      .map(preprocess, num_parallel_calls=AUTOTUNE)'].slice(0, k + 2);
        R.snippet(200, 250, L, { op: fade(u, 0.3), fs: 14 }); }
      if (k === 2) { card(480, 330, 520, 50, { rx: 25, stroke: GOOD, sw: 2.2, s: pop(u, 1.4) }); mono(480, 335, '섞고 → 가공하고 → 묶고 → 미리 준비', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); }
      return; }
    if (k === 6) return s5diag(t, c);
    // 받는 쪽 두 개
    const out = [930, PY5];
    const fitOn = 1, loopOn = k >= 4 ? (k === 4 ? pop(u, 0.2) : 1) : 0;
    const A = [250, 300], B = [700, 300];
    const ga = k === 3 ? E(u, 0.2, 0.9) : 1;
    el('path', { d: `M${out[0] - 20},${PY5 + 20} V170 H${lerp(out[0] - 20, A[0], ga)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.4, opacity: ga > 0 ? 1 : 0 });
    if (ga >= 1) grow(A[0], 170, A[0], A[1] - 44, 1, ACC);
    card(A[0], A[1], 300, 76, { rx: 12, stroke: ACC, sw: 2.4, fill: k === 5 ? PANEL : ACCBG, s: k === 3 ? pop(u, 0.8) : 1, op: k >= 5 ? 0.45 : 1 });
    tx(A[0], A[1] - 10, '고수준 · Keras', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: k >= 5 ? 0.45 : fade(u, 0.9) });
    mono(A[0], A[1] + 18, 'model.fit(ds, epochs=10)', { 'font-size': 14, 'text-anchor': 'middle', opacity: k >= 5 ? 0.45 : fade(u, 1.0) });
    if (k === 3) { for (let i = 0; i < 3; i++) dot([[out[0] - 20, PY5 + 20], [out[0] - 20, 170], [A[0], 170], [A[0], A[1] - 40]], ((t * 0.5 + i / 3) % 1), GOOD, 6);
      sub(A[0], A[1] + 64, '배치 크기는 이미 ds 가 정했다', fade(u, 1.6), { fill: INK, 'font-weight': 700 }); }
    if (k === 4) { el('path', { d: `M${out[0] - 20},170 H${B[0]}`, fill: 'none', stroke: INFO, 'stroke-width': 2.4, opacity: loopOn });
      grow(B[0], 170, B[0], B[1] - 44, E(u, 0.4, 0.9), INFO);
      card(B[0], B[1], 330, 76, { rx: 12, stroke: INFO, sw: 2.4, fill: INFOBG, s: pop(u, 0.6) });
      tx(B[0], B[1] - 10, '저수준 · 커스텀 루프', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO, opacity: fade(u, 0.8) });
      mono(B[0], B[1] + 18, 'for x_batch, y_batch in ds:', { 'font-size': 14, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      sub(480, 400, '같은 ds 객체 · 파이프라인 코드는 한 글자도 안 바뀐다', fade(u, 1.5), { 'font-weight': 700, fill: INK }); }
    if (k === 5) { // GradientTape: 기록 → 되감기 → 갱신
      const ops = ['model(x)', 'loss_fn'], x0 = 450, y = 250;
      el('rect', { x: x0 - 20, y: y - 26, width: 480, height: 52, rx: 8, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
      tx(x0 - 20, y - 36, 'with tf.GradientTape() as tape:  (기록)', { 'font-size': 14, 'font-weight': 700, class: 'mono', fill: INFO });
      ops.forEach((o, i) => { const f = E(u, 0.2 + i * 0.4, 0.6 + i * 0.4); card(x0 + 70 + i * 170, y, 140, 34, { rx: 6, text: o, fs: 14, mono: true, s: f, stroke: INFO });
        if (i) grow(x0 + 70 + (i - 1) * 170 + 72, y, x0 + 70 + i * 170 - 72, y, f, INFO); });
      card(x0 + 400, y, 70, 34, { rx: 6, text: 'loss', fs: 14, mono: true, s: pop(u, 1.0), stroke: ACC, color: ACC });
      const back = E(u, 1.3, 2.0); if (back > 0) el('path', { d: `M${x0 + 400},${y + 30} Q${x0 + 230},${y + 90} ${lerp(x0 + 400, x0 + 70, back)},${y + 34}`, fill: 'none', stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' });
      mono(x0 + 235, y + 96, 'tape.gradient → grads', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 1.6) });
      pill(x0 + 235, y + 140, 'optimizer.apply_gradients(…) → W 갱신', GOOD, pop(u, 2.1), { mono: true, fs: 13.5 }); }
  }
  function s5diag(t, c) { const { k, u } = c, b = c.beat;
    { const D = (b.diagnose || []).slice(0, 2);
      D.forEach((d, i) => { const y = 200 + i * 80, f = fade(u, 0.2 + i * 0.7);
        card(170, y, 240, 54, { rx: 10, stroke: BAD, sw: 2, op: f }); tx(170, y + 6, d.symptom, { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: BAD, opacity: f });
        grow(292, y, 350, y, E(u, 0.4 + i * 0.7, 0.8 + i * 0.7), MUT);
        card(420, y, 130, 54, { rx: 10, stroke: WARN, sw: 2, op: f }); tx(420, y + 6, d.cause, { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: WARN, opacity: f });
        grow(487, y, 540, y, E(u, 0.6 + i * 0.7, 1.0 + i * 0.7), MUT);
        tx(556, y + 6, d.fix, { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.7 + i * 0.7) }); });
      pill(480, 380, '다음 장 IV-1-2 · TFRecord 로 미리 굽기', ACC, pop(u, 1.8), { fs: 14.5 }); } }

  // 장면(Step)마다 확인 문제 하나
  const quiz = [
    { q: '(1000, 4) 특징 배열과 (1000,) 라벨을 from_tensor_slices((x, y)) 에 넣었다. 원소 하나의 모양은 무엇인가?',
      o: ['(1000, 4) 배열 전체와 라벨 1000개', '길이 4 벡터 하나와 스칼라 라벨 하나', '길이 1000 벡터 네 개'], a: 1,
      why: '첫 번째 축만 잘린다. 그래서 원소는 (4,) 벡터와 () 라벨의 쌍이고, 이런 원소가 1000개 흐른다.' },
    { q: '라벨 순으로 정렬된 1000개를 shuffle(100) 으로 섞고 32개씩 묶었다. 첫 배치는 어떤 모습인가?',
      o: ['세 라벨이 고르게 섞인다', '앞쪽 번호(6~120)만 들어 있어 전부 라벨 0이다', '배치 구성이 shuffle(1000) 과 똑같다'], a: 1,
      why: 'shuffle 은 버퍼 크기만큼의 창 안에서만 무작위로 뽑는다. 실행해 보면 shuffle(100) 의 첫 배치는 6~120번, 32개 모두 라벨 0이었다.' },
    { q: 'num_parallel_calls 와 prefetch 가 맡는 일은 각각 무엇인가?',
      o: ['둘 다 배치 크기를 자동으로 정한다', 'num_parallel_calls 는 다음 배치를 미리, prefetch 는 한 배치 안을 여러 코어로', 'num_parallel_calls 는 한 배치 안을 여러 코어로, prefetch 는 다음 배치를 미리'], a: 2,
      why: '병렬 map 은 배치 안의 원소 준비를 나누고, prefetch 는 GPU 가 학습하는 동안 다음 배치를 만들어 둔다. 예시 처리량이 100에서 180, 260 img/s 로 오른 두 단계가 이것이다.' },
    { q: 'cache() 를 무거운 디코딩 map 앞에 두면 어떻게 되는가?',
      o: ['경로만 캐시되어 매 epoch 디코딩을 또 한다', '두 번째 epoch 부터 디코딩을 건너뛴다', '메모리가 모자라 바로 OOM 이 난다'], a: 0,
      why: 'cache 는 그 지점까지의 결과를 저장한다. map 앞이면 저장되는 것이 경로 문자열뿐이라 아끼는 시간이 없다.' },
    { q: '표준 레시피에서 prefetch 를 맨 끝에 두는 까닭은 무엇인가?',
      o: ['완성된 배치를 GPU 학습과 겹쳐 미리 준비하려고', 'shuffle 이 prefetch 뒤에 와야 섞이기 때문에', 'fit 이 prefetch 가 없으면 Dataset 을 받지 않아서'], a: 0,
      why: 'shuffle, map, batch 순서로 만든 배치를 마지막에 prefetch 가 한 칸 앞서 준비한다. 중간에 두면 그 뒤 단계가 다시 직렬이 된다.' },
  ];

  const summary = [
    'from_tensor_slices 는 배열의 첫 축을 잘라 (4,) 벡터와 라벨 쌍 1000개를 흘려보낸다.',
    'shuffle 은 버퍼 크기 안에서만 섞는다. 정렬 데이터에 shuffle(100) 을 쓰니 첫 배치가 전부 라벨 0이었다.',
    '병렬 map 은 배치 안의 준비를 나누고, prefetch 는 다음 배치를 GPU 학습과 겹쳐 만든다.',
    'cache 는 무거운 map 뒤, 랜덤 증강 앞에 두고, 순서는 shuffle, map, batch, prefetch 로 짠다.',
  ];
  const review = [
    { q: '이미지 폴더 파이프라인으로 학습하는데 GPU 사용률이 40~60% 사이를 오르내린다. 먼저 확인할 것은?',
      o: ['모델 층 수를 줄였는지', 'map 에 num_parallel_calls 가 있고 끝에 prefetch 가 붙었는지', 'epochs 를 늘렸는지'], a: 1,
      why: 'GPU 가 들쭉날쭉 노는 것은 데이터 준비가 늦다는 신호다. 병렬 map 과 prefetch 가 빠졌는지부터 본다.' },
    { q: '라벨 순으로 저장된 데이터를 ds.batch(32).shuffle(1000) 으로 학습했더니 손실이 크게 출렁인다. 고칠 방법은?',
      o: ['batch 크기를 64로 늘린다', 'prefetch 를 앞으로 옮긴다', 'shuffle 을 batch 앞으로 옮기고 버퍼를 데이터 크기 근처로 키운다'], a: 2,
      why: 'batch 뒤 shuffle 은 연속 32개 덩어리의 순서만 바꾼다. 원소 단위로 먼저 섞어야 한 배치에 여러 라벨이 들어간다.' },
    { q: '매 epoch 랜덤 뒤집기를 하는 파이프라인에 cache() 를 맨 끝에 붙였더니 검증 정확도가 덜 오른다. 원인으로 가장 그럴듯한 것은?',
      o: ['첫 epoch 의 뒤집기 결과가 저장되어 이후 epoch 에 같은 증강만 나온다', 'cache 가 디코딩을 다시 하게 만든다', 'cache 가 배치 크기를 바꾼다'], a: 0,
      why: '랜덤 증강 뒤에 cache 를 두면 증강 결과까지 굳는다. 결정적 전처리 뒤, 랜덤 증강 앞이 cache 자리다.' },
  ];

  R.page({ title: 'tf.data 파이프라인', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
