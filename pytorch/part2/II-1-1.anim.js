/* II-1-1 간편식 — nn.Sequential — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, cells, zone,
    cross, check, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;
  const fmt = (v) => Math.round(v).toLocaleString('en-US');

  // ---------- 공통 부품 ----------
  // 손글씨 숫자 7 (14×14 칸으로 줄여 그린 MNIST 입력)
  const DIGIT = (r, c) => (r >= 2 && r <= 3 && c >= 3 && c <= 11) || (r >= 3 && r <= 12 && Math.abs(c - (11 - (r - 3) * 0.62)) < 1.1);
  function digit(cx, cy, s, o) { o = o || {}; const n = 14, cs = s / n, x0 = cx - s / 2, y0 = cy - s / 2, rows = o.rows ?? n;
    el('rect', { x: x0 - 3, y: y0 - 3, width: s + 6, height: s + 6, rx: 5, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    for (let r = 0; r < Math.min(n, rows); r++) for (let c = 0; c < n; c++) el('rect', { x: x0 + c * cs, y: y0 + r * cs, width: cs - 0.6, height: cs - 0.6, fill: DIGIT(r, c) ? INK : SOFT, opacity: o.op ?? 1 }); }
  // 세로 벡터: n 칸, 칸마다 값 막대(그림용 무늬, 숫자 없음). o.relu 0→1 이면 음수 막대가 0 으로 줄어든다
  const VAL = (i, seed) => Math.sin(i * 2.17 + seed) * 0.8 + Math.cos(i * 0.9 + seed * 2) * 0.35;
  function vcol(cx, cy, h, n, o) { o = o || {}; const w = o.w || 26, ch = h / n, y0 = cy - h / 2;
    el('rect', { x: cx - w / 2, y: y0, width: w, height: h, rx: 4, fill: o.fill || PANEL, stroke: o.stroke || INK, 'stroke-width': 2, opacity: o.op ?? 1 });
    for (let i = 1; i < n; i++) el('line', { x1: cx - w / 2, y1: y0 + i * ch, x2: cx + w / 2, y2: y0 + i * ch, stroke: GRID, 'stroke-width': 1, opacity: o.op ?? 1 });
    if (o.bars) for (let i = 0; i < n; i++) { let v = VAL(i, o.seed || 0); if (v < 0 && o.relu != null) v = lerp(v, 0, o.relu);
      const bw = Math.abs(v) * (o.bw || 22); if (bw < 0.5) continue;
      el('rect', { x: v >= 0 ? cx + w / 2 + 3 : cx - w / 2 - 3 - bw, y: y0 + i * ch + ch * 0.2, width: bw, height: ch * 0.6, rx: 2, fill: v >= 0 ? ACC : BAD, opacity: (o.op ?? 1) * 0.85 }); }
    if (o.idx) for (let i = 0; i < n; i++) mono(cx + w / 2 + 8, y0 + i * ch + ch / 2 + 5, String(i), { 'font-size': 13.5, fill: MUT, opacity: o.op ?? 1 }); }
  // 깔때기 (Linear): 입 높이 h0 → h1
  function funnel(x0, x1, cy, h0, h1, o) { o = o || {}; const g = o.u ?? 1; if (g <= 0) return; const xe = lerp(x0, x1, g), he = lerp(h0, h1, g);
    el('polygon', { points: `${x0},${cy - h0 / 2} ${xe},${cy - he / 2} ${xe},${cy + he / 2} ${x0},${cy + h0 / 2}`, fill: o.fill || ACCBG, stroke: o.stroke || ACC, 'stroke-width': 2, opacity: o.op ?? 1 }); }
  // 겹친 판으로 그린 3차원 텐서 (C×H×W): w=h 는 공간 크기, d 는 채널 깊이
  function cuboid(cx, cy, w, d, o) { o = o || {}; const s = o.s ?? 1; if (s <= 0) return; const W = w * s, D = d * s, dx = D * 0.7, dy = -D * 0.5, x = cx - W / 2, y = cy - W / 2, st = o.stroke || INK;
    el('polygon', { points: `${x},${y} ${x + dx},${y + dy} ${x + W + dx},${y + dy} ${x + W},${y}`, fill: o.top || SOFT, stroke: st, 'stroke-width': 1.6 });
    el('polygon', { points: `${x + W},${y} ${x + W + dx},${y + dy} ${x + W + dx},${y + W + dy} ${x + W},${y + W}`, fill: o.side || GRID, stroke: st, 'stroke-width': 1.6 });
    el('rect', { x, y, width: W, height: W, fill: o.fill || PANEL, stroke: st, 'stroke-width': 2 }); }
  const shapeTag = (cx, y, s, op, col) => mono(cx, y, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col || INK, opacity: op ?? 1 });

  // =========================================================
  // 1. 파이프 조립 — 층을 넣은 순서대로 shape 가 흐른다
  // =========================================================
  const PY = 190, H784 = 236, H128 = 116, H10 = 64;
  function s1(t, c) { const { k, u } = c;
    if (k <= 5) {
      const fr = k === 0 ? E(u, 0.1, 0.8) : 1;
      el('rect', { x: 22, y: 52, width: 916 * fr, height: 290, rx: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '7 6' });
      mono(36, 44, 'model = nn.Sequential(', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      if (k >= 4) mono(926, 362, ')', { 'font-size': 22, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: k === 4 ? fade(u, 2.0) : 1 });
      // 0 입력
      digit(100, PY, 112, { op: k === 0 ? fade(u, 0.3) : 1, rows: k === 1 ? Math.round(lerp(14, 0, E(u, 0.3, 1.5))) : 14 });
      if (k === 1) for (let r = 0; r < 14; r++) { const g = E(u, 0.3 + r * 0.08, 0.9 + r * 0.08); if (g <= 0 || g >= 1) continue;
        el('rect', { x: lerp(44, 222, g), y: lerp(PY - 56 + r * 8, PY - H784 / 2 + r * (H784 / 14), g), width: lerp(112, 26, g), height: lerp(8, H784 / 14, g), fill: INK, opacity: 0.55 }); }
      shapeTag(100, 372, '(B,1,28,28)', k === 0 ? fade(u, 0.6) : 1, INFO);
      if (k === 0) { sub(480, 200, '아직 층 0개', fade(u, 0.9), { 'font-size': 16, fill: MUT, 'font-weight': 700 }); pill(480, 240, '입력 모양만 정해져 있다', INFO, pop(u, 1.4), { fs: 14 }); }
      // 1 Flatten
      if (k >= 1) { const op = k === 1 ? fade(u, 1.3) : 1; vcol(235, PY, H784, 14, { op });
        lbl(222, 66, 'Flatten', op, { 'font-size': 15, fill: INK, 'text-anchor': 'end' }); shapeTag(235, 372, '(B,784)', op, INFO); }
      // 2 Linear(784,128)
      if (k >= 2) { const g = k === 2 ? E(u, 0.3, 1.4) : 1; funnel(256, 380, PY, H784, H128, { u: g });
        if (g >= 1) vcol(395, PY, H128, 8, {});
        lbl(318, 64, 'Linear(784,128)', k === 2 ? fade(u, 0.4) : 1, { fill: ACC, class: 'mono', 'font-size': 15 });
        shapeTag(395, 372, '(B,128)', k === 2 ? fade(u, 1.5) : 1, INFO);
        if (k === 2) { mono(258, 330, '784', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.6) }); mono(372, 330, '128', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.9) });
          sub(318, 404, '784 는 앞 층이, 128 은 내가 정한다', fade(u, 2.2), { 'font-size': 14, fill: INK, 'font-weight': 700 }); } }
      // 3 ReLU
      if (k >= 3) { const rl = k === 3 ? E(u, 0.9, 2.0) : 1; el('line', { x1: 408, y1: PY, x2: 482, y2: PY, stroke: MUT, 'stroke-width': 2.2 });
        vcol(510, PY, H128, 8, { bars: true, relu: rl, seed: 0.6, bw: 20, op: k === 3 ? fade(u, 0.3) : 1 });
        lbl(510, 108, 'ReLU', k === 3 ? fade(u, 0.3) : 1, { fill: WARN, 'font-size': 15 }); shapeTag(510, 372, '(B,128)', k === 3 ? fade(u, 0.5) : 1, INFO);
        if (k === 3) sub(510, 296, '음수 → 0, 모양 그대로', fade(u, 1.8), { 'font-size': 14, fill: BAD, 'font-weight': 700 }); }
      // 4 Linear(128,10)
      if (k >= 4) { const g = k === 4 ? E(u, 0.3, 1.3) : 1; funnel(560, 690, PY, H128, H10, { u: g });
        if (g >= 1) vcol(720, PY, H10 * 2.6, 10, { idx: true, w: 24 });
        lbl(625, 108, 'Linear(128,10)', k === 4 ? fade(u, 0.4) : 1, { fill: ACC, class: 'mono', 'font-size': 15 });
        shapeTag(720, 372, '(B,10)', k === 4 ? fade(u, 1.4) : 1, INFO);
        if (k === 4) { pill(845, 150, 'logits', ACC, pop(u, 1.5), { mono: true, fs: 15 }); sub(845, 200, '숫자 0~9 점수', fade(u, 1.8), { 'font-size': 14, fill: INK, 'font-weight': 700 }); sub(845, 226, 'softmax 없음', fade(u, 2.2), { 'font-size': 14, fill: MUT }); } }
      // 5 가짜 배치
      if (k === 5) { for (let i = 0; i < 4; i++) dot([[100, PY], [235, PY], [395, PY], [510, PY], [720, PY]], seg(u, 0.2 + i * 0.25, 1.4 + i * 0.25), ACC, 7);
        mono(845, 108, 'logits.shape', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.3) });
        const gx = 772, gw = 9.8; for (let r = 0; r < 4; r++) for (let cc = 0; cc < 10; cc++) { const on = E(u, 1.4 + r * 0.15, 1.7 + r * 0.15); if (on <= 0) continue;
          el('rect', { x: gx + cc * gw, y: 126 + r * 22, width: gw - 1.5, height: 19, rx: 2, fill: ACC, opacity: 0.25 + 0.6 * on }); }
        mono(825, 240, '[4, 10]', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 2.1) });
        if (u > 2.2) check(888, 234, 11, pop(u, 2.2)); }
      return; }
    if (k === 6) { // 지름이 어긋난 파이프
      el('rect', { x: 22, y: 52, width: 916, height: 290, rx: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '7 6' });
      mono(36, 44, 'bad = nn.Sequential(', { 'font-size': 15, 'font-weight': 700, fill: BAD });
      digit(100, PY, 112, {}); vcol(235, PY, H784, 14, {}); funnel(256, 380, PY, H784, H128, {}); vcol(395, PY, H128, 8, {});
      lbl(222, 66, 'Flatten', 1, { 'font-size': 15, 'text-anchor': 'end' }); lbl(318, 64, 'Linear(784,128)', 1, { fill: ACC, class: 'mono' });
      const g = E(u, 0.2, 1.0), H64 = 58; funnel(470, 600, PY, H64, H10 * 0.8, { u: g, stroke: BAD, fill: C.BADBG });
      lbl(540, 120, 'Linear(64,10)', fade(u, 0.3), { fill: BAD, class: 'mono' });
      el('line', { x1: 408, y1: PY - H128 / 2, x2: 470, y2: PY - H64 / 2, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 0.9) });
      el('line', { x1: 408, y1: PY + H128 / 2, x2: 470, y2: PY + H64 / 2, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 0.9) });
      for (let i = 0; i < 5; i++) { const s = seg(u, 0.6 + i * 0.18, 1.3 + i * 0.18); if (s > 0) el('circle', { cx: lerp(100, 430 - i * 13, E(s, 0, 1)), cy: PY + (i % 2 ? 8 : -8), r: 6, fill: s >= 1 ? BAD : ACC }); }
      if (u > 1.4) cross(445, PY - 80, 14, pop(u, 1.4));
      mono(436, 300, '128', { 'font-size': 18, 'font-weight': 800, fill: INK, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      mono(470, 300, '≠', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(506, 300, '64', { 'font-size': 18, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      card(780, 190, 250, 76, { rx: 12, text: '앞 층 출력 128\n뒤 층 입력 64', fs: 16, stroke: BAD, color: BAD, s: pop(u, 2.0) });
      sub(480, 395, 'Sequential 은 크기를 맞춰 주지 않는다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k7: 에러 메시지 = 행렬 곱 크기 대조
    terminal(30, 26, 900, 74, ['>>> bad(x)', ['RuntimeError: mat1 and mat2 shapes cannot be multiplied (4x128 and 64x10)', '#fca5a5']], lerp(0, 2, E(u, 0.1, 0.9)), { fs: 14 });
    const fix = E(u, 1.7, 2.4), m2h = lerp(80, 150, fix), col2 = fix > 0.5 ? GOOD : BAD;
    el('rect', { x: 80, y: 205, width: 260, height: 52, rx: 4, fill: C.INFOBG, stroke: INFO, 'stroke-width': 2.2 });
    mono(210, 237, '4 × 128', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: INFO });
    sub(210, 190, 'mat1 = 입력 배치', fade(u, 0.6), { 'font-size': 14 });
    mono(375, 238, '@', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT });
    el('rect', { x: 410, y: 160 - (m2h - 80) / 2, width: 56, height: m2h, rx: 4, fill: PANEL, stroke: col2, 'stroke-width': 2.2 });
    mono(438, 160 - (m2h - 80) / 2 - 10, fix > 0.5 ? '128×10' : '64×10', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', fill: col2 });
    sub(438, 300, 'mat2 = Linear 가중치', fade(u, 0.6), { 'font-size': 14 });
    mono(312, 278, '128', { 'font-size': 16, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
    el('line', { x1: 280, y1: 268, x2: 340, y2: 268, stroke: INFO, 'stroke-width': 2.5, opacity: fade(u, 0.9) });
    mono(486, 165, fix > 0.5 ? '128' : '64', { 'font-size': 16, 'font-weight': 800, fill: col2, opacity: fade(u, 1.1) });
    el('line', { x1: 478, y1: 160 - (m2h - 80) / 2, x2: 478, y2: 160 - (m2h - 80) / 2 + m2h, stroke: col2, 'stroke-width': 2.5, opacity: fade(u, 1.1) });
    if (fix < 0.5) { if (u > 1.3) cross(375, 330, 13, pop(u, 1.3)); sub(375, 372, '가운데 두 수가 같아야 곱해진다', fade(u, 1.3), { 'font-size': 15, fill: BAD, 'font-weight': 700 }); }
    else { mono(530, 238, '=', { 'font-size': 24, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT });
      el('rect', { x: 560, y: 205, width: 56, height: 52, rx: 4, fill: C.GOODBG, stroke: GOOD, 'stroke-width': 2.2 }); mono(650, 238, '4 × 10', { 'font-size': 17, 'font-weight': 800, fill: GOOD });
      pill(780, 330, 'Linear(128, 10) 로 고치면 통과', GOOD, pop(u, 2.2), { mono: true, fs: 14 }); } }

  // =========================================================
  // 2. 부품 카탈로그 — 작은 CNN 을 부품으로 조립
  // =========================================================
  // 텐서 자리 (cx, 공간크기 w, 채널 깊이 d, 표기)
  const T0 = [75, 96, 4, '3×32×32'], T1 = [210, 96, 19, '16×32×32'], T2 = [338, 48, 19, '16×16×16'], T3 = [438, 48, 38, '32×16×16'], T4 = [540, 24, 38, '32×8×8'];
  const CY2 = 190;
  const tens = (T, s, o) => { cuboid(T[0], CY2, T[1], T[2], Object.assign({ s }, o || {})); };
  const tagT = (T, op, col) => shapeTag(T[0] + T[2] * 0.35, CY2 + T[1] / 2 + 34, T[3], op, col);
  function s2(t, c) { const { k, u } = c;
    const arrow = (x1, x2, g, col) => grow(x1, CY2, x2, CY2, g, col || MUT);
    const head = (x, y, s, op, col) => mono(x, y, s, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: col || ACC, opacity: op });
    const origin = (x, y, s, sc, col) => pill(x, y, s, col || INFO, sc, { fs: 13.5 });
    // 앞 beat 까지 만든 것 (k 이상에서 그대로)
    tens(T0, 1); tagT(T0, 1, INFO);
    if (k === 0) { const g = E(u, 0.3, 1.2);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) el('rect', { x: 27 + 10 + lerp(0, 60, (Math.sin(u * 1.8) + 1) / 2) + j * 9, y: CY2 - 48 + 10 + i * 9 + lerp(0, 50, (Math.cos(u * 1.3) + 1) / 2), width: 8, height: 8, fill: WARN, opacity: fade(u, 0.2) * 0.8 });
      arrow(130, 155, g, ACC); tens(T1, E(u, 1.0, 1.6)); tagT(T1, fade(u, 1.5));
      head(210, 74, 'Conv2d(3, 16, 3, padding=1)', fade(u, 0.4));
      origin(210, 352, 'dl Ⅱ 합성곱', pop(u, 1.8)); pill(400, 352, 'params 448', ACC, pop(u, 2.1), { mono: true, fs: 13.5 });
      sub(640, 190, 'padding=1 → 32×32 유지', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    arrow(130, 155, 1); tens(T1, 1, { fill: k === 1 ? ACCBG : PANEL }); tagT(T1, 1);
    if (k === 1) { head(210, 74, 'BatchNorm2d(16)', fade(u, 0.2));
      mono(316, 132, '16', { 'font-size': 18, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6) }); mono(316, 156, '= 채널 수', { 'font-size': 14, fill: GOOD, opacity: fade(u, 0.8) });
      // 분포: 치우치고 넓은 종 → 0 중심 좁은 종
      const ax = { x: 420, y: 90, w: 440, h: 170 }, g = E(u, 0.9, 2.2), mu = lerp(0.62, 0.5, g), sd = lerp(0.2, 0.09, g);
      el('line', { x1: ax.x, y1: ax.y + ax.h, x2: ax.x + ax.w, y2: ax.y + ax.h, stroke: MUT, 'stroke-width': 1.8 });
      el('line', { x1: ax.x + ax.w / 2, y1: ax.y, x2: ax.x + ax.w / 2, y2: ax.y + ax.h, stroke: GRID, 'stroke-dasharray': '4 4' });
      const pts = []; for (let i = 0; i <= 60; i++) { const z = i / 60, p = Math.exp(-((z - mu) ** 2) / (2 * sd * sd)) * (0.09 / sd) * 0.9; pts.push(`${ax.x + z * ax.w},${ax.y + ax.h - p * ax.h}`); }
      el('polyline', { points: pts.join(' '), fill: 'none', stroke: g > 0.5 ? GOOD : WARN, 'stroke-width': 3, opacity: fade(u, 0.5) });
      mono(ax.x + ax.w / 2, ax.y + ax.h + 22, '0', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle' });
      sub(ax.x + ax.w / 2, 330, '채널마다 평균 0 · 분산 1 로 맞춘다', fade(u, 1.6), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      origin(210, 352, 'dl Ⅴ 배치 정규화', pop(u, 2.0)); return; }
    // k2~: 관용구 반복
    const s2b = (a, b) => (k === 2 ? E(u, a, b) : 1);
    arrow(282, 304, s2b(0.3, 0.6)); tens(T2, s2b(0.5, 1.0)); tagT(T2, s2b(0.8, 1.0));
    arrow(372, 398, s2b(1.0, 1.3)); tens(T3, s2b(1.2, 1.7)); tagT(T3, s2b(1.5, 1.7));
    arrow(490, 518, s2b(1.7, 2.0)); tens(T4, s2b(1.9, 2.3)); tagT(T4, s2b(2.1, 2.3), k === 3 ? WARN : INK);
    if (k === 2) { head(210, 74, 'BN · ReLU', fade(u, 0.1), WARN); head(338, 54, 'MaxPool2d(2)', fade(u, 0.5)); head(438, 74, 'Conv2d(16,32)', fade(u, 1.1));
      head(540, 54, 'BN·ReLU·Pool', fade(u, 1.8), WARN);
      sub(330, 352, 'Pool 한 번마다 (H, W) 절반: 32 → 16 → 8', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k3~: Flatten
    const fl = k === 3 ? E(u, 0.3, 1.4) : 1;
    if (k === 3) { el('line', { x1: 560, y1: CY2, x2: lerp(560, 605, fl), y2: CY2, stroke: MUT, 'stroke-width': 2 }); }
    else el('line', { x1: 560, y1: CY2, x2: 605, y2: CY2, stroke: MUT, 'stroke-width': 2 });
    vcol(620, CY2, 200 * fl + 2, 16, { op: fl, w: 22 }); shapeTag(620, CY2 + 136, '2048', fade(fl, 0.6), INFO);
    if (k === 3) { head(620, 70, 'Flatten', fade(u, 0.3));
      mono(780, 150, '32 × 8 × 8', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      mono(780, 190, '= 2048', { 'font-size': 24, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(780, 240, '다음 Linear 의 입력 크기', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4~: Dropout
    const NX = 690, drop = (i) => [1, 4, 5, 8, 10, 13, 14].includes(i);
    for (let i = 0; i < 16; i++) { const y = CY2 - 100 + i * 12.6 + 6, off = drop(i) && (k > 4 || E(u, 0.6 + i * 0.05, 1.0 + i * 0.05) > 0.5);
      el('circle', { cx: NX, cy: y, r: 5, fill: off ? PANEL : ACC, stroke: off ? OFF : ACC, 'stroke-width': 1.6, opacity: k === 4 ? fade(u, 0.2) : 1 }); }
    if (k === 4) { head(690, 70, 'Dropout(0.5)', fade(u, 0.2), WARN);
      card(830, 160, 200, 70, { rx: 12, text: '학습 때만\n무작위로 끈다', fs: 15, stroke: WARN, s: pop(u, 1.4) });
      sub(830, 230, 'eval() 에서는 모두 켜짐', fade(u, 2.0), { 'font-size': 14, fill: MUT });
      origin(690, 352, 'dl Ⅴ 드롭아웃', pop(u, 1.8), WARN); return; }
    // k5~: Linear(2048, 10)
    const lg = k === 5 ? E(u, 0.3, 1.2) : 1; funnel(705, 800, CY2, 200, 64, { u: lg }); if (lg >= 1) vcol(818, CY2, 150, 10, { w: 22, idx: true });
    shapeTag(818, CY2 + 136, '10', lg, INFO);
    if (k === 5) { head(760, 70, 'Linear(2048, 10)', fade(u, 0.3));
      pill(760, 352, 'params 20,490', ACC, pop(u, 1.5), { mono: true, fs: 14 }); origin(560, 352, 'dl Ⅰ 가중합', pop(u, 1.9)); return; }
    // k6: 전체 확인
    banner(480, 52, 'cnn(torch.randn(4, 3, 32, 32)).shape → [4, 10]', pop(u, 0.3));
    for (let i = 0; i < 3; i++) dot([[75, CY2], [210, CY2], [338, CY2], [438, CY2], [540, CY2], [620, CY2], [690, CY2], [818, CY2]], seg(u, 0.4 + i * 0.3, 1.8 + i * 0.3), ACC, 6);
    pill(330, 360, '부품 11개 · 파라미터 25,674', INK, pop(u, 1.8), { mono: true, fs: 14 });
    if (u > 2.1) check(880, 360, 12, pop(u, 2.1)); }

  // =========================================================
  // 3. 모델 들여다보기 — 인덱스·가중치 모양·파라미터 수
  // =========================================================
  const LAY = [['0', 'Flatten', null, 0], ['1', 'Linear(784→128)', [784, 128], 100480], ['2', 'ReLU', null, 0], ['3', 'Linear(128→10)', [128, 10], 1290]];
  const NAMES = ['flatten', 'fc1', 'act', 'fc2'];
  function s3(t, c) { const { k, u } = c, upto = Math.min(k, 3), ren = k === 8 ? E(u, 0.3, 1.4) : 0;
    tx(30, 40, k === 8 ? 'nn.Sequential(OrderedDict([...]))' : 'model = nn.Sequential(...)', { 'font-size': 14, 'font-weight': 700, fill: MUT, class: 'mono' });
    LAY.forEach(([i, nm, wsh, p], r) => { if (r > upto) return; const y = 74 + r * 72, op = k === r ? fade(u, 0.2) : 1, hot = (k === 5 && r === 1) || (k === 8 && r === 1);
      el('rect', { x: 24, y: y - 4, width: 430, height: 60, rx: 10, fill: hot ? ACCBG : PANEL, stroke: hot ? ACC : GRID, 'stroke-width': 1.6, opacity: op });
      const idxT = ren > 0.5 ? NAMES[r] : `[${i}]`; pill(ren > 0.5 ? 78 : 58, y + 26, idxT, ren > 0.5 ? GOOD : INK, 1, { mono: true, fs: 14, op });
      mono(ren > 0.5 ? 128 : 96, y + 32, nm, { 'font-size': 15, 'font-weight': 700, opacity: op });
      if (wsh) { const W = wsh[0] / 4.4, H = Math.max(4, wsh[1] / 3.4), gx = 444 - W, g = k === r ? E(u, 0.5, 1.3) : 1;
        el('rect', { x: gx, y: y + 26 - H / 2, width: W * g, height: H, fill: ACC, opacity: 0.35 }); el('rect', { x: gx, y: y + 26 - H / 2, width: W * g, height: H, fill: 'none', stroke: ACC, 'stroke-width': 1.5 }); }
      else mono(440, y + 32, 'params 0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: op }); });
    const RX = 490;
    if (k <= 3) { // 오른쪽: 파라미터 막대와 합계
      const tot = tween(c.prev && c.prev.totalParams, c.beat.totalParams, u, 1.4);
      tx(RX, 80, '층별 파라미터 수', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      LAY.forEach(([i, , , p], r) => { if (r > upto) return; const y = 104 + r * 44, g = k === r ? E(u, 0.5, 1.6) : 1;
        mono(RX, y + 15, `[${i}]`, { 'font-size': 14, fill: MUT }); R.hbar(RX + 40, y, 300, p * g, 100480, { col: p ? ACC : OFF, text: fmt(p * g) }); });
      tx(RX, 320, 'total', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      mono(RX + 60, 330, fmt(tot), { 'font-size': 34, 'font-weight': 800, fill: ACC });
      if (k === 0) sub(RX + 200, 380, '학습할 가중치가 없어도 인덱스는 차지', fade(u, 1.6), { 'font-size': 14, fill: INK, 'font-weight': 700 });
      if (k === 1) sub(RX + 200, 380, '784 × 128 + 128 = 100,480', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700, class: 'mono' });
      if (k === 2) sub(RX + 200, 380, 'ReLU 를 넣어도 total 그대로', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      if (k === 3) sub(RX + 200, 380, '128 × 10 + 10 = 1,290  (약 78배 차이)', fade(u, 1.8), { 'font-size': 15, fill: INK, 'font-weight': 700 });
      return; }
    if (k === 4) { terminal(RX, 60, 450, 220, ['>>> print(model)', 'Sequential(', '  (0): Flatten(...)', '  (1): Linear(in=784, out=128)', '  (2): ReLU()', '  (3): Linear(in=128, out=10)', ')'], lerp(0, 7, E(u, 0.2, 2.0)), { fs: 14 });
      sub(RX + 225, 330, '괄호 안 숫자 = 인덱스, 넣은 순서', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 5) { mono(RX, 70, 'model[1].weight.shape', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
      const g = E(u, 0.4, 1.3), x0 = RX + 50, y0 = 110, W = 320 * g, H = 150;
      el('rect', { x: x0, y: y0, width: W, height: H, fill: ACCBG, stroke: ACC, 'stroke-width': 2 });
      for (let i = 1; i < 8; i++) el('line', { x1: x0, y1: y0 + i * H / 8, x2: x0 + W, y2: y0 + i * H / 8, stroke: ACC, 'stroke-width': 0.8, opacity: 0.4 });
      grow(x0 - 18, y0, x0 - 18, y0 + H, E(u, 1.0, 1.5), INFO); mono(x0 - 26, y0 + H / 2 + 5, 'out 128', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      grow(x0, y0 + H + 16, x0 + 320, y0 + H + 16, E(u, 1.3, 1.8), INFO); mono(x0 + 160, y0 + H + 40, 'in 784', { 'font-size': 14, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      pill(RX + 210, 365, 'torch.Size([128, 784])', ACC, pop(u, 2.0), { mono: true, fs: 15 }); return; }
    if (k === 6) { terminal(RX, 60, 450, 200, ['>>> for name, p in model.named_parameters():', '1.weight (128, 784)', '1.bias (128,)', '3.weight (10, 128)', '3.bias (10,)'], lerp(0, 5, E(u, 0.2, 1.8)), { fs: 14 });
      card(RX + 225, 320, 360, 56, { rx: 12, text: '0.weight 가 없다 = Flatten 은 파라미터 0', fs: 15, stroke: WARN, s: pop(u, 2.0) }); return; }
    if (k === 7) { tx(RX, 76, 'sum(p.numel() for p in m.parameters())', { 'font-size': 14, class: 'mono', fill: MUT, opacity: fade(u, 0.2) });
      const g = E(u, 0.4, 1.6), W = 420, w1 = W * 100480 / 101770;
      el('rect', { x: RX, y: 110, width: W, height: 44, rx: 6, fill: SOFT });
      el('rect', { x: RX, y: 110, width: w1 * g, height: 44, rx: 6, fill: ACC });
      el('rect', { x: RX + w1, y: 110, width: (W - w1) * g, height: 44, fill: WARN });
      mono(RX + 10, 138, '[1] 100,480', { 'font-size': 15, 'font-weight': 700, fill: PANEL, opacity: fade(u, 1.0) });
      mono(RX + W, 176, '[3] 1,290 →', { 'font-size': 14, fill: WARN, 'text-anchor': 'end', opacity: fade(u, 1.3) });
      mono(RX + W / 2, 250, fmt(lerp(0, 101770, E(u, 0.4, 1.8))), { 'font-size': 40, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      sub(RX + W / 2, 290, 'count_params(model)', fade(u, 1.0), { 'font-size': 14, class: 'mono' });
      sub(RX + W / 2, 345, '98.7% 가 첫 Linear 한 층에 있다', fade(u, 2.0), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k8: 이름 붙이기
    mono(RX, 90, 'model[1]', { 'font-size': 18, 'font-weight': 700, fill: MUT, 'text-decoration': ren > 0.5 ? 'line-through' : null });
    mono(RX, 140, 'named.fc1', { 'font-size': 22, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.2) });
    grow(RX + 140, 132, RX + 200, 132, E(u, 1.4, 1.8), GOOD);
    mono(RX + 210, 140, 'Linear(784, 128)', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.7) });
    card(RX + 220, 280, 400, 64, { rx: 12, text: '층이 많아질수록\n인덱스보다 이름이 안전하다', fs: 15, stroke: GOOD, s: pop(u, 2.0) }); }

  // =========================================================
  // 4. 한계선 — 한 줄 파이프 밖의 흐름
  // =========================================================
  const RY = 200, XS = [90, 270, 420, 570, 760];
  function rail(o) { o = o || {}; const y = o.y ?? RY, xs = o.xs || XS, nm = o.nm || ['Linear', 'ReLU', 'Linear'];
    el('line', { x1: xs[0] + 30, y1: y, x2: xs[4] - 30, y2: y, stroke: o.col || GRID, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: o.op ?? 1 });
    card(xs[0], y, 60, 48, { rx: 24, text: 'x', fs: 18, stroke: INFO, color: INFO, mono: true, op: o.op });
    nm.forEach((s, i) => card(xs[i + 1], y, 110, 52, { rx: 10, text: s, fs: 15, stroke: i === 1 ? WARN : ACC, fill: PANEL, op: o.op }));
    card(xs[4], y, 64, 48, { rx: 24, text: 'out', fs: 16, stroke: INK, mono: true, op: o.op }); }
  function arc(x1, x2, y, hgt, u, col, o) { o = o || {}; if (u <= 0) return; const n = 40, pts = [];
    for (let i = 0; i <= Math.round(n * clamp(u)); i++) { const s = i / n; pts.push(`${lerp(x1, x2, s)},${y - Math.sin(s * Math.PI) * hgt}`); }
    el('polyline', { points: pts.join(' '), fill: 'none', stroke: col, 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round' }); }
  function s4(t, c) { const { k, u } = c;
    if (k === 0) { rail({ op: fade(u, 0.1) }); for (let i = 0; i < 3; i++) dot([[XS[0], RY], [XS[4], RY]], seg(u, 0.4 + i * 0.4, 1.8 + i * 0.4), ACC, 8);
      pill(480, 90, '입력 1개 → 층 순서대로 → 출력 1개', GOOD, pop(u, 0.6), { fs: 15 }); if (u > 2.0) check(860, RY, 16, pop(u, 2.0));
      sub(480, 320, 'MLP · 단순 CNN — Sequential 이 가장 짧다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 1) { rail({});
      const px = 690; el('circle', { cx: px, cy: RY, r: 18, fill: PANEL, stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 0.3) }); mono(px, RY + 7, '+', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.3) });
      arc(XS[0], px, RY - 30, 110, E(u, 0.4, 1.4), BAD, { dash: '9 7' });
      const s = seg(u, 1.4, 2.2); if (s > 0) el('circle', { cx: lerp(XS[0], XS[0] + 120, E(s, 0, 1)), cy: RY - 30 - Math.sin(lerp(0, 0.2, E(s, 0, 1)) * Math.PI) * 110, r: 8, fill: INFO });
      if (u > 2.0) cross(XS[0] + 140, RY - 112, 14, pop(u, 2.0));
      mono(480, 38, 'out = f(x) + x', { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 0.2) });
      sub(480, 320, 'Sequential 은 이전 층 출력만 넘긴다 — x 를 실어 나를 통로가 없다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    const box = (op) => { zone(150, 100, 500, 200, 'class ResidualBlock(nn.Module)', { stroke: INFO, fill: R.C.INFOBG, op }); zone(185, 160, 430, 90, 'self.f = nn.Sequential(...)', { stroke: ACC, fill: PANEL, op, dash: '6 4' }); };
    const inner = (op) => { el('line', { x1: 230, y1: 215, x2: 570, y2: 215, stroke: GRID, 'stroke-width': 8, opacity: op });
      ['Linear', 'ReLU', 'Linear'].forEach((s, i) => card(260 + i * 140, 215, 96, 40, { rx: 8, text: s, fs: 14, stroke: i === 1 ? WARN : ACC, op })); };
    if (k === 2) { box(fade(u, 0.2)); inner(fade(u, 0.8));
      card(80, 215, 60, 44, { rx: 22, text: 'x', fs: 18, stroke: INFO, color: INFO, mono: true, s: pop(u, 0.4) }); card(800, 215, 76, 44, { rx: 22, text: 'out', fs: 16, mono: true, s: pop(u, 0.4) });
      pill(800, 110, '뼈대 = Module', INFO, pop(u, 1.4), { fs: 14 }); pill(800, 150, '직선 덩어리 = Sequential', ACC, pop(u, 1.7), { fs: 14 });
      sub(480, 360, '둘은 경쟁이 아니라 협력한다', fade(u, 2.1), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 3) { box(1); inner(1);
      card(80, 215, 60, 44, { rx: 22, text: 'x', fs: 18, stroke: INFO, color: INFO, mono: true }); card(870, 215, 76, 44, { rx: 22, text: 'out', fs: 16, mono: true });
      const px = 720; el('line', { x1: 612, y1: 215, x2: px - 18, y2: 215, stroke: MUT, 'stroke-width': 2.2 }); el('line', { x1: px + 18, y1: 215, x2: 830, y2: 215, stroke: MUT, 'stroke-width': 2.2 });
      el('circle', { cx: px, cy: 215, r: 18, fill: C.GOODBG, stroke: GOOD, 'stroke-width': 2.5 }); mono(px, 222, '+', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD });
      el('polyline', { points: `110,195 110,80 ${px},80 ${px},197`, fill: 'none', stroke: GOOD, 'stroke-width': 3, 'stroke-dasharray': `${E(u, 0.3, 1.2) * 1000} 1000` });
      dot([[110, 195], [110, 80], [px, 80], [px, 197]], seg(u, 1.0, 2.2), INFO, 8); dot([[110, 215], [px - 18, 215]], seg(u, 1.0, 2.2), ACC, 8);
      mono(415, 66, 'return self.f(x) + x', { 'font-size': 16, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 0.6) });
      sub(480, 360, 'forward 를 직접 쓰면 우회로·조건·반복이 열린다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    // k4: 다중 입력
    zone(40, 60, 420, 280, 'Sequential.forward(x)', { stroke: BAD, fill: PANEL });
    zone(500, 60, 420, 280, 'forward(self, img, txt)', { stroke: GOOD, fill: PANEL });
    const port = (x, y, col) => { el('rect', { x: x - 8, y: y - 18, width: 16, height: 36, rx: 4, fill: col }); };
    port(330, 200, BAD); port(800, 165, GOOD); port(800, 235, GOOD);
    card(120, 165, 84, 40, { rx: 8, text: 'img', fs: 15, mono: true, stroke: INFO, color: INFO }); card(120, 245, 84, 40, { rx: 8, text: 'txt', fs: 15, mono: true, stroke: WARN, color: WARN });
    dot([[162, 165], [322, 200]], seg(u, 0.3, 1.1), INFO, 8);
    const b = seg(u, 0.9, 1.9); if (b > 0) el('circle', { cx: b < 0.6 ? lerp(162, 300, b / 0.6) : lerp(300, 240, (b - 0.6) / 0.4), cy: b < 0.6 ? lerp(245, 215, b / 0.6) : lerp(215, 300, (b - 0.6) / 0.4), r: 8, fill: WARN });
    if (u > 1.7) cross(250, 305, 12, pop(u, 1.7)); sub(250, 330, '인자 자리가 하나뿐', fade(u, 1.8), { 'font-size': 14, fill: BAD, 'font-weight': 700 });
    card(580, 165, 84, 40, { rx: 8, text: 'img', fs: 15, mono: true, stroke: INFO, color: INFO }); card(580, 235, 84, 40, { rx: 8, text: 'txt', fs: 15, mono: true, stroke: WARN, color: WARN });
    dot([[622, 165], [792, 165]], seg(u, 1.2, 2.0), INFO, 8); dot([[622, 235], [792, 235]], seg(u, 1.3, 2.1), WARN, 8);
    if (u > 2.1) check(860, 200, 14, pop(u, 2.1)); sub(710, 330, '입력 두 개를 받아 중간에서 합친다', fade(u, 2.2), { 'font-size': 14, fill: GOOD, 'font-weight': 700 });
    mono(480, 390, '분기 · 다중 입력 · 조건 흐름 = Sequential 로는 표현 불가', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, opacity: fade(u, 2.4) }); }

  // =========================================================
  // 5. 실무 위치 — 헤드 · 중첩 블록 · 넘어갈 시점
  // =========================================================
  function headBlock(cx, cy, s, o) { o = o || {}; if (s <= 0) return; const g = R.G(cx, cy, s);
    el('rect', { x: -112, y: -42, width: 224, height: 84, rx: 12, fill: ACCBG, stroke: ACC, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }, g);
    tx(-100, -50, o.title || 'head = nn.Sequential', { 'font-size': 14, 'font-weight': 700, fill: ACC, class: 'mono' }, g);
    card(-50, 0, 86, 38, { rx: 8, text: 'Dropout', fs: 14, stroke: WARN, p: g }); card(52, 0, 96, 38, { rx: 8, text: 'Linear', fs: 14, stroke: ACC, p: g }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { card(130, 200, 170, 170, { rx: 14, text: '백본\n(ResNet 등)', fs: 16, stroke: OFF, color: MUT, fill: SOFT, s: pop(u, 0.2) });
      grow(218, 200, 300, 200, E(u, 0.5, 0.9), MUT); vcol(320, 200, 160, 10, { op: fade(u, 0.7) }); shapeTag(320, 305, '512', fade(u, 0.9), INFO);
      headBlock(520, 200, pop(u, 1.0)); grow(636, 200, 700, 200, E(u, 1.6, 1.9), ACC); vcol(720, 200, 90, 10, { op: fade(u, 1.8), w: 22 }); shapeTag(720, 270, '10', fade(u, 1.9), INFO);
      pill(520, 300, 'params 5,130', ACC, pop(u, 2.0), { mono: true, fs: 14 });
      sub(480, 370, '백본 끝의 몇 층은 곧게 흐른다 → Sequential 이 가장 짧다', fade(u, 2.3), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 4) { // 판단 기준
    const needs = [['한 줄로 쭉 흐른다', 0], ['프로토타입 · 헤드', 0], ['분기 / skip', 1], ['다중 입력·출력', 1], ['조건·반복 흐름', 1], ['같은 층 재사용', 1]];
      zone(60, 230, 360, 170, 'nn.Sequential', { stroke: GOOD, fill: R.C.GOODBG }); zone(500, 230, 400, 170, 'nn.Module', { stroke: INFO, fill: R.C.INFOBG });
      let a = 0, b = 0; needs.forEach(([s, bin], i) => { const f = E(u, 0.3 + i * 0.3, 0.8 + i * 0.3), sx = 160 + (i % 3) * 300, sy = 60 + Math.floor(i / 3) * 60;
        const j = bin ? b++ : a++, ex = bin ? 600 + (j % 2) * 200 : 240, ey = bin ? 290 + Math.floor(j / 2) * 56 : 290 + j * 56;
        pill(lerp(sx, ex, f), lerp(sy, ey, f), s, bin ? INFO : GOOD, 1, { fs: 14 }); });
      sub(480, 130, '하나라도 오른쪽에 해당하면 그 즉시 nn.Module', fade(u, 2.2), { 'font-size': 16, fill: INK, 'font-weight': 700 }); return; }
    // k1~: MyNet 뼈대
    zone(40, 70, 880, 250, 'class MyNet(nn.Module)', { stroke: INFO, fill: R.C.INFOBG, op: k === 1 ? fade(u, 0.1) : 1 });
    const fs = k === 1 ? pop(u, 0.6) : 1;
    if (fs > 0) { const g = R.G(300, 200, fs); el('rect', { x: -200, y: -60, width: 400, height: 120, rx: 12, fill: PANEL, stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g);
      tx(-186, -68, 'self.features = nn.Sequential', { 'font-size': 14, 'font-weight': 700, fill: ACC, class: 'mono' }, g);
      [['Conv2d(3,32)', ACC, -138, 108], ['ReLU', WARN, -48, 64], ['AdaptiveAvgPool2d(4)', INFO, 92, 176]].forEach(([s, col, x, w]) => card(x, 0, w, 40, { rx: 8, text: s, fs: 13.5, mono: true, stroke: col, p: g })); }
    const slot = [700, 200];
    if (k === 1) { el('rect', { x: slot[0] - 112, y: slot[1] - 42, width: 224, height: 84, rx: 12, fill: 'none', stroke: OFF, 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: fade(u, 1.0) });
      sub(slot[0], slot[1] + 5, 'self.classifier = ?', fade(u, 1.0), { 'font-size': 14, class: 'mono' });
      shapeTag(300, 300, '(B,3,32,32) → (B,32,4,4)', fade(u, 1.6), INFO);
      sub(480, 370, '뼈대는 Module, 곧게 흐르는 특징 추출부는 Sequential', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const f = E(u, 0.3, 1.3); headBlock(lerp(200, slot[0], f), lerp(370, slot[1], f), 1, { title: 'self.classifier' });
      if (u > 1.4) { pill(700, 110, 'head 와 같은 객체', WARN, pop(u, 1.4), { fs: 14 }); }
      card(700, 370, 340, 48, { rx: 10, text: '두 자리에 쓰면 가중치를 공유한다', fs: 15, stroke: WARN, s: pop(u, 1.9) }); return; }
    headBlock(slot[0], slot[1], 1, { title: 'self.classifier' });
    if (k === 3) { el('line', { x1: 490, y1: 200, x2: 588, y2: 200, stroke: MUT, 'stroke-width': 2.2 });
      card(540, 255, 104, 34, { rx: 8, text: 'flatten(1)', fs: 13.5, mono: true, stroke: MUT, s: pop(u, 0.9) });
      dot([[90, 200], [490, 200], [588, 200], [812, 200], [900, 200]], seg(u, 0.3, 2.3), ACC, 8);
      shapeTag(300, 300, '(B,32,4,4)', fade(u, 0.8), INFO); shapeTag(540, 300, '(B,512)', fade(u, 1.3), INFO); shapeTag(700, 300, '(B,10)', fade(u, 1.9), INFO);
      sub(480, 370, '블록은 Sequential 이 흘리고, 블록 사이는 forward 가 잇는다', fade(u, 2.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
  }

  // ---------- 확인 문제 ----------
  const quiz = [
    { q: 'nn.Sequential(nn.Flatten(), nn.Linear(784, 128), nn.Linear(64, 10)) 에 배치를 넣으면 어떻게 되는가?',
      o: ['Sequential 이 64 를 128 로 알아서 맞춘다', '행렬 곱 크기가 안 맞아 RuntimeError 가 난다', '출력이 (B, 64) 로 나온다'], a: 1,
      why: '앞 층 출력 128 과 뒤 층 입력 64 가 달라 mat1 and mat2 shapes cannot be multiplied (4x128 and 64x10) 가 난다. 숫자는 직접 이어 줘야 한다.' },
    { q: '작은 CNN 에서 Flatten 뒤 Linear 의 입력 크기가 32*8*8 인 이유는 무엇인가?',
      o: ['Conv2d 의 kernel_size 가 8 이라서', '32 채널이 MaxPool2d(2) 를 두 번 거쳐 8×8 이 되어서', 'Dropout 이 절반을 꺼서'], a: 1,
      why: '32×32 입력이 Pool 두 번으로 16, 8 로 줄고 채널은 32 다. 그래서 펼치면 32×8×8 = 2048 이다.' },
    { q: 'Flatten · Linear(784,128) · ReLU · Linear(128,10) 모델의 파라미터는 대부분 어디에 있는가?',
      o: ['[3] Linear(128→10)', '[2] ReLU', '[1] Linear(784→128)'], a: 2,
      why: '[1] 이 784×128+128 = 100,480 개로 전체 101,770 개의 98.7% 다. ReLU·Flatten 은 0 개다.' },
    { q: 'out = f(x) + x 를 nn.Sequential 로 만들 수 없는 이유는 무엇인가?',
      o: ['이전 층 출력만 다음 층으로 넘겨 x 를 따로 보관할 길이 없어서', 'Sequential 안에는 Linear 를 두 번 넣을 수 없어서', '덧셈 연산이 GPU 에서만 되어서'], a: 0,
      why: 'Sequential 은 한 줄 파이프라 입력 x 를 건너뛰어 나중에 더하는 통로가 없다. forward 를 직접 쓰는 nn.Module 이 필요하다.' },
    { q: '실무에서 nn.Sequential 을 쓰기 가장 알맞은 자리는 어디인가?',
      o: ['입력 두 개를 받아 합치는 모델 전체', '백본 끝의 Dropout → Linear 분류 헤드', '같은 층을 조건에 따라 반복하는 루프'], a: 1,
      why: '헤드처럼 곧게 흐르는 덩어리는 Sequential 이 가장 짧다. 다중 입력·조건·반복은 nn.Module 의 몫이다.' },
  ];

  const summary = [
    'nn.Sequential 은 넣은 순서대로 데이터가 흐르는 파이프라 forward 를 쓰지 않아도 된다.',
    '앞 층 출력과 뒤 층 입력이 784, 128, 10 처럼 이어져야 하고 어긋나면 행렬 곱 에러가 난다.',
    '파라미터 101,770 개 중 100,480 개가 첫 Linear 한 층에 있고 print(model) 로 바로 보인다.',
    '분기나 다중 입력이 필요하면 nn.Module 로 뼈대를 잡고 곧은 덩어리만 Sequential 로 감싼다.',
  ];
  const review = [
    { q: 'MNIST 모델을 32×32 컬러 이미지에 그대로 썼더니 첫 Linear 에서 크기 에러가 났다. 먼저 고칠 곳은?',
      o: ['Flatten 뒤 Linear 의 입력 크기를 3×32×32 = 3072 로 바꾼다', '마지막 Linear 의 출력 10 을 늘린다', 'ReLU 를 Sigmoid 로 바꾼다'], a: 0,
      why: 'Flatten 이 내는 크기가 바뀌었으니 바로 뒤 Linear 의 입력도 그 값과 이어져야 한다. 활성화나 출력 수는 원인이 아니다.' },
    { q: '모델 크기를 줄이려고 ReLU 를 하나 뺐는데 count_params 가 그대로다. 왜 그런가?',
      o: ['count_params 가 캐시된 값을 돌려줘서', 'ReLU 는 학습할 파라미터가 0 개라서', 'ReLU 의 파라미터는 Linear 에 합쳐져 세어져서'], a: 1,
      why: 'ReLU·Flatten 같은 층은 계산만 하고 가중치가 없다. 크기를 줄이려면 Linear·Conv 의 입출력을 줄여야 한다.' },
    { q: 'ResNet 처럼 블록마다 입력을 더하는 모델을 만들려 한다. 알맞은 구성은?',
      o: ['블록 전체를 nn.Sequential 하나에 나열한다', 'OrderedDict 로 층에 이름을 붙인 Sequential 을 쓴다', 'nn.Module 의 forward 에서 더하고, 블록 안 직선 구간만 Sequential 로 묶는다'], a: 2,
      why: '이름을 붙여도 Sequential 은 여전히 한 줄 파이프다. 덧셈 우회로는 forward 를 직접 쓰는 Module 이 맡는다.' },
  ];

  R.page({ title: 'nn.Sequential 파이프', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
