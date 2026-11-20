/* II-1-1 합성곱 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 필터 = 이미지 위를 미끄러지는 "돋보기 창". 창이 멈출 때마다 9쌍을 곱해 더한 숫자 하나가 feature map 칸에 떨어진다.
 * 격자 숫자는 페이지 데이터(INPUT_5x5·FILTER_X·EDGE_IMG…)와 코드 실행 출력(벤브에서 확인)에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, cross, check, cells, heat } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, WARNBG, INFO, INFOBG, HL } = C;
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15.5, 'font-weight': 700, opacity: op }, a || {}));

  const IN = [[1, 2, 0, 1, 3], [0, 1, 2, 3, 1], [3, 1, 0, 2, 2], [2, 0, 1, 3, 0], [1, 2, 3, 0, 1]];
  const KX = [[1, 0, 1], [0, 1, 0], [1, 0, 1]];
  const OUT = [[5, 8, 8], [6, 7, 6], [7, 6, 9]];
  const EDGE = Array.from({ length: 5 }, () => [0, 0, 9, 9, 9]);
  const VF = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], HF = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
  const VR = [[27, 27, 0], [27, 27, 0], [27, 27, 0]], HR = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  // 창 테두리 (r,c)는 소수도 허용 → 미끄러지는 움직임
  function win(x, y, cs, r, c, n, col, op) { el('rect', { x: x + c * cs - 4, y: y + r * cs - 4, width: n * cs + 5, height: n * cs + 5, rx: 7, fill: 'none', stroke: col || WARN, 'stroke-width': 4, opacity: op ?? 1 }); }
  function empty(x, y, n, cs, o) { o = o || {}; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) el('rect', { x: x + c * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 4, fill: PANEL, stroke: OFF, 'stroke-dasharray': '4 3', 'stroke-width': 1.5, opacity: o.op ?? 1 }); }
  const sweep = (u, a, b) => { const f = clamp((u - a) / (b - a)) * 8.999; return { i: Math.floor(f), f }; };   // 9 위치를 a→b 초 동안

  // ---------- 1. MLP 로 이미지 ----------
  const BAR = Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => (r >= 1 && r <= 3 && c === 1 ? 9 : 0)));   // img[1:4, 1:2] = 9
  const SHF = BAR.map((row) => row.map((_, c) => row[(c + 4) % 5]));                                                               // np.roll(img, 1, axis=1)
  const V1 = BAR.flat(), V2 = SHF.flat(), DIFF = V1.map((v, i) => v !== V2[i]);
  function strip(x, y, v, cw, o) { o = o || {}; v.forEach((val, i) => { const d = o.diff && DIFF[i], op = o.u == null ? 1 : clamp(o.u * 25 - i);
      el('rect', { x: x + i * cw, y, width: cw - 2, height: 30, rx: 3, fill: val ? ACC : SOFT, opacity: op * (val ? 0.85 : 1), stroke: d ? BAD : 'none', 'stroke-width': d ? 2.5 : 0 });
      if (val) mono(x + i * cw + (cw - 2) / 2, y + 20, '9', { 'font-size': 13.5, 'text-anchor': 'middle', fill: PANEL, 'font-weight': 700, opacity: op }); }); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) { // 28×28 → 784 → 100
      const g = 6.2, x0 = 50, y0 = 70; for (let r = 0; r < 28; r++) for (let q = 0; q < 28; q++) { const on = (Math.abs(q - 14) < 3 && r > 4 && r < 24) || (r > 4 && r < 8 && q > 9 && q < 15);
        el('rect', { x: x0 + q * g, y: y0 + r * g, width: g - 0.6, height: g - 0.6, fill: on ? INK : SOFT, opacity: k === 0 ? fade(u, 0.1 + r * 0.01) : 1 }); }
      lbl(x0 + 87, y0 + 196, '28 × 28', 1, { class: 'mono' });
      const sx = 300, fl = k === 0 ? E(u, 0.6, 1.3) : 1;
      for (let i = 0; i < 28; i++) el('rect', { x: sx, y: 60 + i * 9.5 * fl, width: 22, height: 8, fill: i % 4 === 1 ? INK : OFF, opacity: fl });
      lbl(311, 345, '784', fl, { class: 'mono' });
      const hx = 470; for (let i = 0; i < 10; i++) { const hy = 72 + i * 26, f = k === 0 ? E(u, 1.2 + i * 0.03, 1.8 + i * 0.03) : 1;
        for (let j = 0; j < 28; j += 3) if (f > 0) el('line', { x1: sx + 22, y1: 64 + j * 9.5, x2: lerp(sx + 22, hx - 10, f), y2: lerp(64 + j * 9.5, hy, f), stroke: GRID, 'stroke-width': 0.8 });
        el('circle', { cx: hx, cy: hy, r: 10 * (k === 0 ? pop(u, 1.4 + i * 0.03) : 1), fill: PANEL, stroke: INK, 'stroke-width': 2 }); }
      lbl(470, 345, '100', fade(u, 1.5), { class: 'mono' });
      if (k === 0) { mono(560, 140, '784 × 100', { 'font-size': 22, 'font-weight': 700, opacity: fade(u, 1.8) }); mono(560, 190, '= 78,400', { 'font-size': 28, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.1) });
        sub(700, 240, '첫 층 가중치만', fade(u, 2.2), { 'font-size': 15 }); return; }
      ['#R', '#G', '#B'].forEach((_, i) => el('rect', { x: 580 + i * 16, y: 70 + i * 16, width: 110, height: 110, rx: 6, fill: [BAD, GOOD, INFO][i], opacity: 0.55 * pop(u, 0.2 + i * 0.2), stroke: PANEL, 'stroke-width': 2 }));
      mono(650, 230, '1000×1000×3', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.7) });
      mono(650, 256, '= 3,000,000 차원', { 'font-size': 15, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 0.9) });
      tx(560, 300, 'MNIST', { 'font-size': 14.5, opacity: fade(u, 1.1) }); R.hbar(640, 287, 180, Math.log10(78400), 8.5, { u: E(u, 1.1, 1.5), col: ACC, text: '78,400' });
      tx(560, 340, '사진', { 'font-size': 14.5, opacity: fade(u, 1.4) }); R.hbar(640, 327, 180, Math.log10(3e8), 8.5, { u: E(u, 1.5, 2.1), col: BAD, text: '3억' });
      sub(740, 384, '막대 = log 스케일 · 첫 층만 3억 파라미터', fade(u, 2.2), { 'font-size': 14 }); return; }
    // k ≥ 2: 막대 이미지
    const cs = 46, A = [60, 60], B = [380, 60];
    if (k === 2) { heat(A[0], A[1], BAR.map((row, r) => row.map((v) => v * clamp(u * 2 - 0.4 - r * 0.2))), cs, { max: 9, fmt: (v) => (v > 4.5 ? '9' : '0') });
      lbl(A[0] + 113, 50, 'img (5×5)', fade(u, 0.3));
      mono(560, 130, 'img = np.zeros((5, 5))', { 'font-size': 16, opacity: fade(u, 0.4) }); mono(560, 166, 'img[1:4, 1:2] = 9', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0) });
      sub(720, 220, '행 1~3, 열 1 에 세로 막대', fade(u, 1.8), { 'font-size': 15 }); return; }
    const sh = k === 3 ? E(u, 0.3, 1.0) : 1;
    heat(A[0], A[1], BAR, cs, { max: 9, fmt: (v) => (v ? '9' : '') }); lbl(A[0] + 113, 50, '원본', 1);
    if (sh > 0) { heat(lerp(A[0], B[0], sh), B[1], SHF, cs, { max: 9, fmt: (v) => (v ? '9' : '') }); lbl(lerp(A[0], B[0], sh) + 113, 50, '1px 이동', sh); }
    grow(300, 175, 370, 175, k === 3 ? E(u, 0.9, 1.2) : 1, MUT); mono(335, 165, 'roll', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT });
    const fu = k === 3 ? E(u, 1.3, 2.4) : 1; tx(36, 330, 'v1', { 'font-size': 15, 'font-weight': 700, opacity: fu > 0 ? 1 : 0 }); tx(36, 372, 'v2', { 'font-size': 15, 'font-weight': 700, opacity: fu > 0 ? 1 : 0 });
    strip(66, 308, V1, 25, { u: fu, diff: k >= 4 }); strip(66, 350, V2, 25, { u: fu, diff: k >= 4 });
    if (k === 3) { sub(760, 120, '2D 격자 → 25칸 한 줄', fade(u, 1.6), { 'font-size': 15 }); sub(760, 150, '"옆 픽셀" 정보가 사라진다', fade(u, 2.0), { 'font-size': 15, fill: BAD }); return; }
    if (k === 4) { card(800, 130, 200, 70, { rx: 12, stroke: BAD, text: `${Math.round(6 * E(u, 0.4, 1.4))} / 25`, fs: 30, mono: true, color: BAD, s: pop(u, 0.3) });
      sub(800, 196, '(v1 != v2).sum()', fade(u, 1.2), { 'font-size': 14.5, class: 'mono' }); sub(800, 226, '같은 막대인데 6칸이 다르다', fade(u, 1.8), { 'font-size': 15, fill: BAD }); return; }
    if (k === 5) { // 같은 막대가 서로 다른 가중치에 닿는다
      const nx = 800, ny = 170; el('circle', { cx: nx, cy: ny, r: 24, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); mono(nx, ny + 6, 'h', { 'font-size': 16, 'text-anchor': 'middle', 'font-weight': 700 });
      [6, 11, 16].forEach((i, j) => grow(66 + i * 25 + 11, 308, nx - 20, ny + 10, E(u, 0.4 + j * 0.15, 1.0 + j * 0.15), INFO, { sw: 2, plain: true }));
      [7, 12, 17].forEach((i, j) => grow(66 + i * 25 + 11, 350, nx - 14, ny + 18, E(u, 1.1 + j * 0.15, 1.7 + j * 0.15), WARN, { sw: 2, plain: true }));
      mono(880, 120, 'w₆ w₁₁ w₁₆', { 'font-size': 15, fill: INFO, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.9) });
      mono(880, 236, 'w₇ w₁₂ w₁₇', { 'font-size': 15, fill: WARN, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      sub(800, 282, '위치마다 다른 가중치 → 따로 배워야 한다', fade(u, 2.2), { 'font-size': 14.5, fill: BAD }); return; }
    // k6: 필요한 것 — 지역 창을 모든 위치에서 재사용
    const p = sweep(u, 0.4, 2.0); const r = Math.floor(p.f / 3), cc = p.f % 3; win(A[0], A[1], cs, Math.min(2, r), Math.min(2, cc), 3, ACC);
    for (let i = 0; i <= p.i; i++) el('circle', { cx: 830 + (i % 3) * 34, cy: 110 + Math.floor(i / 3) * 34, r: 12, fill: ACC, opacity: 0.85 });
    pill(870, 240, '① 지역만 보는 눈 (3×3)', ACC, pop(u, 0.5), { fs: 14.5 }); pill(870, 282, '② 모든 위치에서 재사용', ACC, pop(u, 1.6), { fs: 14.5 });
    note(560, 384, '→ 이것이 합성곱이다', fade(u, 2.3), { fill: ACC, 'font-size': 17 }); }

  // ---------- 2. 합성곱 = 슬라이딩 창 ----------
  const GX = 40, GY = 70, CS = 54, FX = 380, FY = 110, FS = 44, OX = 610, OY = 90, OS = 62;
  function terms(r, c) { const T = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (KX[i][j]) T.push(`${IN[r + i][c + j]}×1`); return T; }
  function s2(t, c) { const { k, u } = c;
    heat(GX, GY, IN, CS, { max: 3, fs: 16 });
    lbl(GX + 133, GY - 16, 'image (5×5)', 1);
    heat(FX, FY, KX, FS, { max: 1, col: INFO, fs: 15 }); lbl(FX + 64, FY - 14, 'kernel', k === 6 ? fade(u, 0.3) : 1, { fill: INFO });
    tx(FX - 30, FY + 74, '×', { 'font-size': 24, 'font-weight': 700, fill: MUT }); tx(OX - 48, FY + 74, '=', { 'font-size': 24, 'font-weight': 700, fill: MUT });
    lbl(OX + 92, OY - 16, 'feature map', 1, { fill: ACC });
    if (k === 0) { empty(OX, OY, 3, OS, { op: 0.4 }); card(OX + 92, OY + 92, 70, 50, { rx: 10, text: '?', fs: 28, stroke: ACC, color: ACC, s: pop(u, 1.0) });
      mono(480, 330, 'def conv2d(image, kernel) -> fmap', { 'font-size': 17, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      sub(480, 364, '함수 하나 = 합성곱의 전부', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 1) { [0, 1, 2].forEach((j) => win(GX, GY, CS, 0, j, 3, j === 0 ? WARN : OFF, fade(u, 0.3 + j * 0.4)));
      [0, 1, 2].forEach((j) => mono(GX + j * CS + 80, GY + 300, `j=${j}`, { 'font-size': 14, 'text-anchor': 'middle', fill: WARN, opacity: fade(u, 0.4 + j * 0.4) }));
      mono(OX - 20, 330, 'H − kh + 1 = 5 − 3 + 1 = 3', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.5) });
      empty(OX, OY, 3, OS, { op: fade(u, 2.0) }); sub(OX + 92, 380, '출력 3 × 3', fade(u, 2.2), { 'font-size': 15, fill: ACC }); return; }
    if (k === 2) { const n = Math.round(9 * E(u, 0.4, 1.6)); for (let i = 0; i < 9; i++) { const r = Math.floor(i / 3), cc = i % 3;
        el('rect', { x: OX + cc * OS, y: OY + r * OS, width: OS - 3, height: OS - 3, rx: 4, fill: PANEL, stroke: OFF, 'stroke-dasharray': '4 3', 'stroke-width': 1.5, opacity: i < n ? 1 : 0 });
        if (i < n) mono(OX + cc * OS + 29, OY + r * OS + 36, '0', { 'font-size': 15, 'text-anchor': 'middle', fill: OFF }); }
      mono(OX - 20, 330, 'out = np.zeros((3, 3))', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
    if (k === 3) { const p = sweep(u, 0.3, 2.5), r = Math.floor(p.f / 3), cc = p.f % 3, sm = p.f - p.i;
      win(GX, GY, CS, r, Math.min(2, cc), 3, WARN);
      for (let i = 0; i < 9; i++) { const rr = Math.floor(i / 3), q = i % 3, cur = i === p.i;
        el('rect', { x: OX + q * OS, y: OY + rr * OS, width: OS - 3, height: OS - 3, rx: 4, fill: cur ? WARNBG : PANEL, stroke: cur ? WARN : OFF, 'stroke-dasharray': cur ? null : '4 3', 'stroke-width': cur ? 3 : 1.5 });
        if (i <= p.i) mono(OX + q * OS + 29, OY + rr * OS + 36, `${i + 1}`, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT }); }
      mono(OX - 20, 330, `for i … for j …   (i, j) = (${r}, ${Math.floor(cc)})`, { 'font-size': 16, 'font-weight': 700 });
      sub(480, 372, 'j 가 오른쪽으로 다 돌면 i 가 한 줄 내려간다', fade(u, 0.6), { 'font-size': 15 }); return; }
    const fillTo = (n) => { for (let i = 0; i < 9; i++) { const r = Math.floor(i / 3), q = i % 3;
      if (i < n) { const cur = i === n - 1 && k === 7 && n < 9; card(OX + q * OS + 29.5, OY + r * OS + 29.5, OS - 3, OS - 3, { rx: 4, stroke: cur ? WARN : 'none', sw: 3, fill: ACCBG, text: String(OUT[r][q]), fs: 19, mono: true, color: ACC }); }
      else el('rect', { x: OX + q * OS, y: OY + r * OS, width: OS - 3, height: OS - 3, rx: 4, fill: PANEL, stroke: OFF, 'stroke-dasharray': '4 3', 'stroke-width': 1.5 }); } };
    if (k === 4) { win(GX, GY, CS, 0, 0, 3, WARN); fillTo(E(u, 1.8, 2.0) > 0.5 ? 1 : 0);
      mono(GX, 368, 'window = image[0:3, 0:3]', { 'font-size': 15, opacity: fade(u, 0.3) });
      mono(GX, 396, 'out[0,0] = (window * kernel).sum()', { 'font-size': 15, opacity: fade(u, 0.8) });
      mono(OX - 30, 330, terms(0, 0).join(' + ') + ' = 5', { 'font-size': 15.5, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) }); return; }
    if (k === 5) { fillTo(0); [[0, 4, '3'], [2, 0, '3'], [3, 3, '3']].forEach(([r, q], i) => el('circle', { cx: GX + q * CS + 25, cy: GY + r * CS + 25, r: 24, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: pop(u, 0.6 + i * 0.3) }));
      sub(480, 350, '진할수록 큰 값 (0 ~ 3) — 코드의 image 와 같은 숫자', fade(u, 1.6), { 'font-size': 15 }); return; }
    if (k === 6) { fillTo(0); [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]].forEach(([r, q], i) => el('rect', { x: FX + q * FS - 2, y: FY + r * FS - 2, width: FS + 1, height: FS + 1, rx: 5, fill: 'none', stroke: INFO, 'stroke-width': 3, opacity: pop(u, 0.4 + i * 0.2) }));
      sub(FX + 64, FY + 160, '가운데 + 네 모서리 = 1', fade(u, 1.5), { 'font-size': 15, fill: INFO }); sub(FX + 64, FY + 186, '십자(X) 모양 필터', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 7) { const p = sweep(u, 0.2, 2.4), r = Math.floor(p.f / 3), cc = p.i % 3; win(GX, GY, CS, r, cc, 3, WARN); fillTo(p.i + 1);
      mono(OX - 30, 330, `(${r},${cc}): ${terms(r, cc).join(' + ')} = ${OUT[r][cc]}`, { 'font-size': 15, 'font-weight': 700 });
      mono(OX - 30, 362, 'print(fmap) → [[5 8 8] [6 7 6] [7 6 9]]', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 2.4) }); return; }
    // k8 첫 칸 손검산
    fillTo(9); win(GX, GY, CS, 0, 0, 3, WARN); el('rect', { x: OX - 2, y: OY - 2, width: OS + 1, height: OS + 1, rx: 5, fill: 'none', stroke: WARN, 'stroke-width': 3.5 });
    const W = [[1, 2, 0], [0, 1, 2], [3, 1, 0]], items = [];
    W.forEach((row, i) => row.forEach((v, j) => items.push([v, KX[i][j]])));
    items.forEach(([v, kk], i) => { const x = 40 + i * 64, op = fade(u, 0.3 + i * 0.15), on = kk === 1;
      mono(x + 20, 378, `${v}·${kk}`, { 'font-size': 16, 'text-anchor': 'middle', fill: on ? ACC : OFF, 'font-weight': on ? 700 : 400, opacity: op }); if (i < 8) mono(x + 52, 378, '+', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: op }); });
    mono(620, 378, '= 1+1+3 = 5', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) }); check(830, 371, 11, pop(u, 2.3)); }

  // ---------- 3. 필터 = 특징 탐지기 ----------
  function s3(t, c) { const { k, u } = c, ix = 40, iy = 80, ics = 46;
    const em = k === 0 ? EDGE.map((row) => row.map((v, q) => v * clamp(u * 2 - 0.3 - q * 0.2))) : EDGE;
    heat(ix, iy, em, ics, { max: 9, fmt: (v) => (v > 4.5 ? '9' : '0') }); lbl(ix + 113, iy - 16, 'edge_img', 1);
    el('line', { x1: ix + 2 * ics - 1.5, y1: iy - 6, x2: ix + 2 * ics - 1.5, y2: iy + 5 * ics + 2, stroke: BAD, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: k === 0 ? fade(u, 1.6) : 1 });
    if (k === 0) { sub(ix + 113, iy + 260, '세로 경계 하나', fade(u, 1.8), { 'font-size': 15, fill: BAD });
      tx(360, 140, '왼쪽 두 열 = 0 (어두움)', { 'font-size': 16, opacity: fade(u, 0.6) }); tx(360, 180, '오른쪽 세 열 = 9 (밝음)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      mono(360, 250, 'np.array([[0, 0, 9, 9, 9]] * 5)', { 'font-size': 16, opacity: fade(u, 2.0) }); return; }
    const fx = 340, fcs = 40, rx = 620, rcs = 52;
    const row = (y, F, name, col, op) => { heat(fx, y, F, fcs, { max: 1, fs: 14, col: ACC }); lbl(fx + 58, y - 10, name, op, { fill: col }); };
    const showV = k >= 1 && k < 6, showH = k >= 2 && k !== 5 && k !== 7;
    if (showV) row(70, VF, 'v_filter', ACC, k === 1 ? fade(u, 0.2) : 1);
    if (showH) row(250, HF, 'h_filter', INFO, k === 2 ? fade(u, 0.2) : 1);
    if (k === 1) { sub(560, 100, '−1 (빨강) = 왼쪽 열', fade(u, 0.8), { 'font-size': 15, fill: BAD }); sub(560, 130, '+1 = 오른쪽 열', fade(u, 1.1), { 'font-size': 15, fill: ACC });
      note(480, 200, '"오른쪽 − 왼쪽" 밝기 차이', fade(u, 1.6)); return; }
    if (k === 2) { sub(560, 280, '−1 = 위 행 · +1 = 아래 행', fade(u, 0.8), { 'font-size': 15 }); note(480, 340, '"아래 − 위" 밝기 차이', fade(u, 1.5)); return; }
    const resp = (y, M, f, col) => { heat(rx, y, M.map((rw, r) => rw.map((v, q) => (r * 3 + q < f ? v : 0))), rcs, { max: 27, fs: 16, fmt: (v) => String(v) }); };
    if (k === 3) { const p = sweep(u, 0.3, 2.0); win(ix, iy, ics, Math.floor(p.f / 3), p.i % 3, 3, WARN); grow(fx + 126, 130, rx - 12, 130, 1, MUT); resp(70, VR, p.i + 1);
      lbl(rx + 76, 60, '반응', 1, { fill: ACC }); note(rx - 20, 260, '경계를 걸친 창 = 27', fade(u, 2.1), { fill: ACC }); sub(rx + 76, 290, '(9 × 3) − (0 × 3)', fade(u, 2.3), { 'font-size': 15 }); return; }
    if (k >= 3) { grow(fx + 126, 130, rx - 12, 130, 1, MUT); resp(70, VR, 9); }
    if (k === 4) { const p = sweep(u, 0.3, 2.0); win(ix, iy, ics, Math.floor(p.f / 3), p.i % 3, 3, INFO); grow(fx + 126, 310, rx - 12, 310, 1, MUT);
      heat(rx, 250, HR, rcs, { max: 27, fs: 16, hi: (r, q) => r * 3 + q === p.i }); note(40, 380, '가로 필터 반응: 전부 0 — 위아래 변화가 없다', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 5) { // feature map = 위치 지도: 반응을 입력 위에 겹친다
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) if (VR[r][q]) el('rect', { x: ix + (q + 1) * ics - 4, y: iy + (r + 1) * ics - 4, width: ics - 6, height: ics - 6, rx: 8, fill: 'none', stroke: WARN, 'stroke-width': 3, opacity: pop(u, 0.4 + (r * 3 + q) * 0.15) });
      note(330, 300, 'feature map = "그 특징이 어디에 얼마나 있는가"', fade(u, 1.4)); sub(560, 336, '27 이 뜬 칸 = 경계를 덮은 창의 중심', fade(u, 1.9), { 'font-size': 15 }); return; }
    if (k === 6) { heat(rx, 250, HR, rcs, { max: 27, fs: 16 }); grow(fx + 126, 310, rx - 12, 310, 1, MUT); }
    if (k === 6) { const g = E(u, 0.8, 1.6); el('rect', { x: fx - 8, y: 62, width: 136, height: 136, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2, opacity: g });
      for (let i = 0; i < 9; i++) mono(fx + 18 + (i % 3) * 40, 100 + Math.floor(i / 3) * 40, 'w', { 'font-size': 18, 'text-anchor': 'middle', 'font-weight': 700, fill: ACC, opacity: g });
      pill(180, 380, '고전 CV: 사람이 설계 (Sobel, Gabor)', MUT, pop(u, 0.3), { fs: 14 }); pill(560, 380, 'CNN: 9개 값 = 학습 파라미터', ACC, pop(u, 1.6), { fs: 14 }); return; }
    // k7 무작위 → 역전파
    const L = [[0.03, -0.104, 0.075], [0.094, -0.195, -0.13], [0.013, -0.032, -0.002]];
    el('rect', { x: fx - 8, y: 62, width: 136, height: 136, rx: 10, fill: PANEL, stroke: INK, 'stroke-width': 2 });
    heat(fx, 70, L, fcs, { max: 0.2, fs: 13.5, col: ACC, fmt: (v) => v.toFixed(2).replace('0.', '.').replace('-.', '−.') });
    lbl(fx + 58, 54, 'learned (seed 42)', fade(u, 0.3), { fill: ACC, 'font-size': 15 });
    for (let i = 0; i < 3; i++) { const f = E(u, 1.0 + i * 0.3, 1.6 + i * 0.3); grow(fx + 60 + (i - 1) * 50, 236, fx + 60 + (i - 1) * 40, 206, f, BAD, { sw: 3 }); }
    mono(fx + 58, 262, '← ∂loss/∂w', { 'font-size': 15, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 1.4) });
    sub(fx + 58, 292, '역전파가 9개를 조정', fade(u, 1.9), { 'font-size': 15 });
    note(330, 380, '"무엇을 볼지" 를 데이터가 정한다', fade(u, 2.3), { fill: ACC }); }

  // ---------- 4. 채널과 다중 필터 ----------
  function slab(x, y, w, h, n, dx, dy, cols, o) { o = o || {}; for (let i = n - 1; i >= 0; i--) el('rect', { x: x + i * dx, y: y + i * dy, width: w, height: h, rx: 4, fill: cols[i % cols.length], stroke: PANEL, 'stroke-width': 1.5, opacity: (o.op ?? 1) * (o.hi != null && o.hi !== i ? 0.35 : 0.85) }); }
  const RGB = [BAD, GOOD, INFO];
  const WIN = [[[8, 6, 5], [0, 0, 0], [6, 9, 5]], [[8, 5, 0], [8, 1, 0], [5, 0, 2]], [[7, 3, 4], [9, 3, 6], [8, 6, 7]]];   // rgb[:, 0:3, 0:3] (seed 0)
  function s4(t, c) { const { k, u } = c;
    if (k <= 2 || k === 5 || k === 6) {
      slab(60, 110, 120, 120, 3, 14, 14, RGB, { op: k === 0 ? pop(u, 0.2) : 1 }); lbl(140, 300, k >= 5 ? 'rgb (3, 5, 5)' : 'image (C, H, W)', 1, { class: 'mono' });
      tx(230, 185, '×', { 'font-size': 26, fill: MUT, 'font-weight': 700 });
      const nf = k === 0 ? 3 : 8; for (let i = 0; i < nf; i++) slab(280 + i * 9, 120 + i * 9, 54, 54, 3, 6, 6, [ACC], { op: k === 0 ? pop(u, 0.6) : k === 5 ? pop(u, 0.4 + i * 0.1) : 1 });
      lbl(340, 300, k >= 5 ? 'filters (32, 3, 3, 3)' : 'kernels (K, C, kh, kw)', k === 0 ? fade(u, 0.8) : 1, { class: 'mono' });
      if (k === 0) { sub(480, 360, '채널 축(C) 과 필터 축(K) 이 함께 들어온다', fade(u, 1.4), { 'font-size': 15 }); return; }
      tx(470, 185, '=', { 'font-size': 26, fill: MUT, 'font-weight': 700 });
      const nm = k === 1 ? Math.round(8 * E(u, 0.5, 1.8)) : 8;
      for (let i = 0; i < nm; i++) { const x = 530 + i * 16, y = 110 + i * 12; el('rect', { x, y, width: 90, height: 90, rx: 4, fill: k === 2 ? PANEL : ACCBG, stroke: ACC, 'stroke-width': 1.6, 'stroke-dasharray': k === 2 ? '4 3' : null }); }
      lbl(650, 330, k === 6 ? 'fmaps (32, 3, 3)' : k === 2 ? 'out (K, 3, 3) = 0' : 'K 장의 feature map', k === 1 ? fade(u, 1.6) : 1, { class: k === 1 ? null : 'mono', fill: ACC });
      if (k === 1) { sub(650, 362, '필터 1개 → map 1장', fade(u, 2.0), { 'font-size': 15 }); return; }
      if (k === 2) { sub(650, 362, '공간 크기 규칙은 그대로: 5 − 3 + 1 = 3', fade(u, 1.2), { 'font-size': 15 }); return; }
      if (k === 5) { sub(480, 380, 'rng = default_rng(0) · normal(0, 0.1)', fade(u, 1.6), { 'font-size': 14.5, class: 'mono' }); return; }
      card(850, 160, 170, 60, { rx: 12, stroke: ACC, text: '32 장', fs: 26, color: ACC, s: pop(u, 0.8) }); sub(850, 220, 'print(fmaps.shape)', fade(u, 1.2), { 'font-size': 14, class: 'mono' });
      sub(650, 380, '필터 개수 = 출력 채널 수', fade(u, 1.8), { 'font-size': 15.5, fill: ACC }); return; }
    if (k === 3) { const kk = Math.min(7, Math.floor(E(u, 0.3, 2.3) * 8));
      for (let i = 0; i < 8; i++) { slab(80 + i * 46, 110, 38, 38, 3, 4, 4, [i === kk ? ACC : OFF]); el('rect', { x: 80 + i * 46, y: 230, width: 38, height: 38, rx: 4, fill: i <= kk ? ACCBG : PANEL, stroke: i === kk ? ACC : GRID, 'stroke-width': i === kk ? 3 : 1.5 });
        mono(97 + i * 46, 100, `k${i}`, { 'font-size': 13.5, 'text-anchor': 'middle', fill: i === kk ? ACC : MUT }); }
      grow(99 + kk * 46, 165, 99 + kk * 46, 224, 1, ACC);
      mono(500, 140, 'for k in range(K):', { 'font-size': 16, 'font-weight': 700, fill: ACC });
      mono(500, 170, '    for i …  for j …', { 'font-size': 16 }); sub(640, 220, 'Step 2 의 이중 루프 바깥에 한 겹 더', fade(u, 1.0), { 'font-size': 15 }); sub(640, 330, '(그림은 32개 중 앞 8개)', 1, { 'font-size': 13.5 }); return; }
    if (k === 4) { // 3채널 창 × 3채널 필터 → 숫자 하나
      WIN.forEach((m, ch) => { const y = 60 + ch * 110, op = fade(u, 0.2 + ch * 0.3); heat(60, y, m, 32, { max: 9, col: RGB[ch], fs: 13.5 }); tx(36, y + 56, 'RGB'[ch], { 'font-size': 15, 'font-weight': 700, fill: RGB[ch], opacity: op });
        tx(170, y + 54, '×', { 'font-size': 20, fill: MUT }); el('rect', { x: 196, y, width: 93, height: 93, rx: 6, fill: ACCBG, stroke: ACC, 'stroke-width': 1.8, opacity: op }); mono(242, y + 52, `f[0,${ch}]`, { 'font-size': 14, 'text-anchor': 'middle', fill: ACC, opacity: op });
        grow(300, y + 46, 440, 210, E(u, 1.0 + ch * 0.2, 1.5 + ch * 0.2), MUT, { sw: 1.8 }); });
      card(500, 210, 110, 56, { rx: 10, stroke: ACC, text: 'Σ', fs: 24, color: ACC, s: pop(u, 1.6) }); grow(556, 210, 640, 210, E(u, 1.8, 2.1), ACC);
      card(720, 210, 140, 56, { rx: 10, fill: ACCBG, stroke: ACC, text: '4.47', fs: 22, mono: true, color: ACC, s: pop(u, 2.1) });
      sub(720, 266, 'fmaps[0, 0, 0]', fade(u, 2.2), { 'font-size': 14.5, class: 'mono' }); sub(720, 300, '3채널 → 숫자 하나', fade(u, 2.4), { 'font-size': 15 }); return; }
    // k7 계층
    const LV = [['conv1', '엣지 · 색 대비'], ['conv2', '질감 · 모서리'], ['conv3', '눈 · 귀 · 바퀴'], ['conv4+', '얼굴 · 자동차']];
    LV.forEach(([n, d], i) => { const x = 60 + i * 225, a = 0.3 + i * 0.5, s = pop(u, a); el('rect', { x, y: 90, width: 180, height: 150, rx: 10, fill: PANEL, stroke: i === 3 ? ACC : GRID, 'stroke-width': 2, opacity: s });
      const cx = x + 90, cy = 165;
      if (i === 0) [[-40, -30, -40, 30], [0, -30, 0, 30], [40, -30, 40, 30]].forEach(([a1, b1, a2, b2]) => el('line', { x1: cx + a1, y1: cy + b1, x2: cx + a2, y2: cy + b2, stroke: INK, 'stroke-width': 4, opacity: s }));
      if (i === 1) for (let q = 0; q < 4; q++) for (let r = 0; r < 3; r++) el('path', { d: `M${cx - 60 + q * 32},${cy - 30 + r * 26} l14,10 l14,-10`, fill: 'none', stroke: INK, 'stroke-width': 2.5, opacity: s });
      if (i === 2) { el('ellipse', { cx: cx - 30, cy, rx: 20, ry: 12, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: s }); el('circle', { cx: cx - 30, cy, r: 5, fill: INK, opacity: s }); el('circle', { cx: cx + 35, cy, r: 24, fill: 'none', stroke: INK, 'stroke-width': 3, opacity: s }); el('circle', { cx: cx + 35, cy, r: 7, fill: INK, opacity: s }); }
      if (i === 3) { el('circle', { cx, cy: cy + 5, r: 40, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: s }); el('path', { d: `M${cx - 34},${cy - 18} l6,-34 l18,22 M${cx + 34},${cy - 18} l-6,-34 l-18,22`, fill: 'none', stroke: ACC, 'stroke-width': 3, opacity: s }); [[-14, 0], [14, 0]].forEach(([dx]) => el('circle', { cx: cx + dx, cy, r: 4, fill: ACC, opacity: s })); }
      lbl(cx, 270, n, s, { class: 'mono', fill: i === 3 ? ACC : INK }); sub(cx, 296, d, fade(u, a + 0.2), { 'font-size': 14.5 });
      if (i) grow(x - 40, 165, x - 6, 165, E(u, a - 0.1, a + 0.1), MUT); });
    sub(480, 350, '앞 층 특징을 조합 → 추상도 상승 (사람이 설계하지 않았다)', fade(u, 2.2), { 'font-size': 15.5, fill: ACC }); }

  // ---------- 5. 파라미터 공유 ----------
  function cmpBars(u, a, rows) { rows.forEach(([n, v, s, col], i) => { const y = 250 + i * 46; tx(60, y + 16, n, { 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, a + i * 0.3) });
      R.hbar(300, y, 450, v, rows[0][1], { u: E(u, a + i * 0.3, a + 0.6 + i * 0.3), col, text: s }); }); }
  function s5(t, c) { const { k, u } = c;
    if (k === 0) { // 가중치 행렬 + bias 벡터 = numel 합
      heat(80, 90, Array.from({ length: 4 }, (_, r) => Array.from({ length: 6 }, (_, q) => ((r * 7 + q * 3) % 5) / 5 + 0.1)), 40, { max: 1, fmt: () => '', col: INFO });
      lbl(200, 76, 'weight', fade(u, 0.3), { fill: INFO }); heat(340, 90, [[0.5], [0.5], [0.5], [0.5]], 40, { max: 1, fmt: () => '', col: WARN }); lbl(358, 76, 'bias', fade(u, 0.5), { fill: WARN });
      mono(480, 140, 'sum(p.numel() for p', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.9) }); mono(480, 170, '    in layer.parameters())', { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.9) });
      sub(560, 230, 'weight 원소 + bias 원소 = 정확한 개수', fade(u, 1.6), { 'font-size': 15 }); return; }
    const SMALL = [['FC Linear(784, 100)', 78500, '78,500', BAD], ['Conv2d(1, 32, 3)', 320, '320', ACC]];
    const BIG = [['FC Linear(150528, 1000)', 150529000, '150,529,000', BAD], ['Conv2d(3, 64, 7)', 9472, '9,472', ACC]];
    if (k === 1) { mono(60, 90, '784 × 100 + 100', { 'font-size': 22, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(60, 140, '= 78,500', { 'font-size': 28, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.9) });
      for (let r = 0; r < 10; r++) for (let q = 0; q < 28; q++) el('rect', { x: 460 + q * 15, y: 60 + r * 15, width: 13, height: 13, fill: BAD, opacity: 0.6 * clamp(u * 2 - 0.4 - (r * 28 + q) / 280) });
      sub(670, 230, '입력 784 × 뉴런 100 가중치 (일부)', fade(u, 1.4), { 'font-size': 14 }); cmpBars(u, 1.6, SMALL.slice(0, 1)); return; }
    if (k === 2) { for (let i = 0; i < 32; i++) heat(60 + (i % 16) * 46, 60 + Math.floor(i / 16) * 46, [[1, 1, 1], [1, 1, 1], [1, 1, 1]], 13, { max: 2, fmt: () => '', col: ACC });
      mono(60, 190, '3 × 3 × 1 × 32 + 32 = 320', { 'font-size': 20, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.6) });
      cmpBars(u, 1.0, SMALL); card(860, 372, 150, 46, { rx: 10, stroke: ACC, text: '≈ 1/245', fs: 20, mono: true, color: ACC, s: pop(u, 2.2) }); return; }
    if (k === 3) { ['R', 'G', 'B'].forEach((_, i) => el('rect', { x: 70 + i * 14, y: 60 + i * 14, width: 120, height: 120, rx: 6, fill: RGB[i], opacity: 0.5 * pop(u, 0.2 + i * 0.2) }));
      mono(260, 110, '224 × 224 × 3 = 150,528 입력', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.6) }); mono(260, 150, '× 1000 뉴런 + 1000', { 'font-size': 18, opacity: fade(u, 1.0) });
      mono(260, 196, '= 150,529,000 (1.5억)', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.4) }); cmpBars(u, 1.8, BIG.slice(0, 1)); return; }
    if (k === 4) { mono(60, 110, '7 × 7 × 3 × 64 + 64 = 9,472', { 'font-size': 22, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.3) });
      sub(300, 160, '필터 64개 · 크기 7×7 · 입력 3채널', fade(u, 0.8), { 'font-size': 15 }); cmpBars(u, 1.0, BIG);
      card(850, 372, 170, 46, { rx: 10, stroke: ACC, text: '≈ 1/15,890', fs: 19, mono: true, color: ACC, s: pop(u, 2.2) }); return; }
    // k ≥ 5 : 이동 등변성
    const gx = 50, gy = 70, g = 30, ox = 520, oy = 85, og = 34;
    const dot = (x0, sh, op) => { for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) el('rect', { x: x0 + q * g, y: gy + r * g, width: g - 2, height: g - 2, rx: 3, fill: r === 2 && q === 2 + sh ? INK : SOFT, opacity: op }); };
    if (k === 5) { dot(gx, 0, 1); lbl(gx + 120, 56, 'x (8×8)', 1, { class: 'mono' }); const s = E(u, 0.8, 1.6); dot(ox, 0, s); for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++) if (r === 2 && q === 3) el('rect', { x: ox + q * g, y: gy + r * g, width: g - 2, height: g - 2, rx: 3, fill: INK, opacity: s }); el('rect', { x: ox + 2 * g, y: gy + 2 * g, width: g - 2, height: g - 2, rx: 3, fill: SOFT, opacity: s });
      lbl(ox + 120, 56, 'x_shift (오른쪽 1px)', s, { class: 'mono' }); grow(gx + 250, 190, ox - 20, 190, E(u, 0.5, 1.0), MUT); mono(400, 180, 'roll', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
      sub(480, 360, 'x[0, 0, 2, 2] = 1.0  — 점 하나', fade(u, 1.8), { 'font-size': 15, class: 'mono' }); return; }
    const resp = (x0, sh, op, lab) => { for (let r = 0; r < 6; r++) for (let q = 0; q < 6; q++) { const on = r <= 2 && q >= sh && q <= 2 + sh; el('rect', { x: x0 + q * og, y: oy + r * og, width: og - 3, height: og - 3, rx: 4, fill: on ? ACC : SOFT, opacity: op * (on ? 0.75 : 1) }); } lbl(x0 + 100, oy - 14, lab, op, { class: 'mono' }); };
    if (k === 6) { resp(60, 0, fade(u, 0.3), 'roll(conv(x), 1)'); resp(ox, 1, fade(u, 0.8), 'conv(x_shift)');
      grow(60 + 6 * og + 20, oy + 50, ox - 20, oy + 50, E(u, 1.0, 1.4), MUT); mono(400, oy + 40, '같은가?', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, 1.0) });
      card(480, 340, 300, 50, { rx: 10, stroke: GOOD, text: 'allclose(…) → True', fs: 18, mono: true, color: GOOD, s: pop(u, 1.8) }); sub(480, 386, '(맨 왼쪽 열은 roll 이 감아 넘긴 칸이라 [..., 1:] 로 비교)', fade(u, 2.2), { 'font-size': 13.5 }); return; }
    if (k === 7) { resp(60, 0, 1, '점이 왼쪽'); resp(ox, 1, 1, '점이 오른쪽'); 
      note(140, 340, '같은 필터가 전 위치를 훑는다', fade(u, 0.5)); note(140, 376, '→ 발화 위치만 옮겨갈 뿐 "발화한다" 는 같다', fade(u, 1.3), { fill: ACC }); check(880, 360, 12, pop(u, 2.0)); return; }
    // k8 다음 장 — 풀링 · 스트라이드 (모양만)
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) el('rect', { x: 80 + q * 46, y: 90 + r * 46, width: 43, height: 43, rx: 4, fill: ACCBG, stroke: ((r >> 1) + (q >> 1)) % 2 ? ACC : INFO, 'stroke-width': 2.2, opacity: fade(u, 0.3) });
    grow(280, 182, 350, 182, E(u, 0.8, 1.1), MUT); for (let r = 0; r < 2; r++) for (let q = 0; q < 2; q++) el('rect', { x: 370 + q * 52, y: 132 + r * 52, width: 49, height: 49, rx: 4, fill: ACC, opacity: 0.7 * pop(u, 1.0 + (r * 2 + q) * 0.15) });
    lbl(250, 320, '풀링: 2×2 를 1칸으로', fade(u, 0.8)); sub(250, 346, '파라미터 0개로 크기 축소', fade(u, 1.2), { 'font-size': 14.5 });
    for (let q = 0; q < 6; q++) el('rect', { x: 560 + q * 52, y: 150, width: 49, height: 49, rx: 4, fill: SOFT, stroke: GRID, opacity: fade(u, 1.4) });
    const sx = E(u, 1.7, 2.4); el('rect', { x: 556 + (sx > 0.5 ? 2 : 0) * 52, y: 146, width: 3 * 52 + 2, height: 57, rx: 6, fill: 'none', stroke: WARN, 'stroke-width': 3.5, opacity: fade(u, 1.5) });
    lbl(715, 320, '스트라이드 2: 창을 두 칸씩', fade(u, 1.6)); sub(715, 346, '다음 장에서', fade(u, 2.2), { 'font-size': 14.5 }); }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '5×5 막대 이미지를 오른쪽으로 1px 밀고 flatten하면, MLP 입장에서는 어떻게 되나?',
      o: ['같은 벡터라 똑같이 인식한다', '25개 원소 중 6개가 달라 다른 입력이 된다', '원소 1개만 달라 거의 같다'], a: 1,
      why: 'flatten은 이웃 정보를 버리므로, 같은 막대라도 위치마다 따로 외워야 한다. 학습이 아니라 암기다.' },
    { q: '5×5 입력에 3×3 필터를 한 칸씩 밀며 합성곱하면 출력 크기는?',
      o: ['3×3', '5×5', '2×2'], a: 0,
      why: '창을 가로·세로 각각 5−3+1 = 3곳에 놓을 수 있어 출력은 3×3이다. 출력 한 칸은 창 9칸과 필터 9칸의 곱의 합이다.' },
    { q: '세로 경계만 있는 이미지에 가로 엣지 필터를 대면 반응은 어떻게 되나?',
      o: ['경계 열에서 27이 나온다', '전부 9가 나온다', '전부 0이 나온다'], a: 2,
      why: '위아래 밝기 변화가 없으니 가로 필터 반응은 전부 0이고, 세로 필터만 경계에서 27을 낸다. 필터는 자기가 찾는 패턴만 본다.' },
    { q: '(3, 5, 5) RGB 입력에 (3, 3, 3) 필터 32개를 적용하면 출력 shape은?',
      o: ['(32, 3, 3)', '(96, 3, 3)', '(3, 3, 3)'], a: 0,
      why: '채널을 관통하는 내적의 결과는 숫자 하나라서 필터 하나당 feature map 1장이 나온다. 필터 개수 32 = 출력 채널 수다.' },
    { q: '28×28 입력의 첫 층에서 Conv(필터 32개)가 FC(뉴런 100개)보다 파라미터가 훨씬 적은 이유는?',
      o: ['bias를 쓰지 않아서', '같은 필터 하나를 모든 위치에서 재사용해서', '입력을 먼저 절반으로 줄여서'], a: 1,
      why: '파라미터 공유다. FC는 78,500개, Conv는 320개로 약 245분의 1이고, 입력이 밀리면 출력도 그대로 밀리는 이동 등변성이 덤으로 생긴다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '이미지를 펴서 MLP에 넣으면 파라미터가 폭발하고, 한 칸만 밀려도 다른 입력이 된다.',
    '합성곱은 3×3 필터를 밀며 겹친 칸끼리 곱해 더한다. 이웃 픽셀 관계가 계산에 남는다.',
    '필터 값도 학습으로 얻는다. 층을 쌓으면 엣지, 질감, 부품, 객체 순으로 특징이 생긴다.',
    '같은 필터를 모든 위치에 재사용해서, 28×28 입력의 첫 층 파라미터가 FC의 약 245분의 1이다.',
  ];
  const review = [
    { q: '고양이가 사진 왼쪽 위에 있을 때만 맞히고 오른쪽 아래에 있으면 틀리는 모델이 있다. 첫 층으로 가장 의심되는 것은?',
      o: ['3×3 합성곱 층', '이미지를 펴서 받는 완전연결 층', '필터 32개짜리 합성곱 층'], a: 1,
      why: '완전연결 층은 위치마다 다른 가중치를 써서 위치별로 따로 외운다. 합성곱은 같은 필터가 모든 위치를 훑어 어디서든 반응한다.' },
    { q: '금속 표면의 가는 세로 긁힘을 찾는 CNN을 만든다. 필터 값은 어떻게 정하나?',
      o: ['Sobel 같은 필터를 사람이 직접 고른다', '모든 필터를 같은 값으로 고정한다', '무작위로 시작해 역전파로 배우게 한다'], a: 2,
      why: 'CNN은 필터의 숫자를 학습 파라미터로 두고 데이터가 정하게 한다. 사람이 필터를 고르는 것은 고전 컴퓨터 비전의 방식이다.' },
    { q: 'RGB 입력에 3×3 합성곱을 쓰는데, 출력 채널을 32에서 64로 늘렸다. 바뀌는 것은?',
      o: ['필터 개수와 출력 feature map 장수', '필터 하나의 깊이', '출력 feature map의 가로세로 크기'], a: 0,
      why: '필터 하나가 3채널을 관통해 feature map 1장을 내므로, 출력 채널 수가 곧 필터 개수다. 필터 깊이는 입력 채널 3을 따르고 가로세로는 그대로다.' },
  ];

  RA.page({ title: '합성곱 — 미끄러지는 창', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
