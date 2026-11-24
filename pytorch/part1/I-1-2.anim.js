/* I-1-2 텐서 연산·브로드캐스팅·shape 디버깅 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, pill, grow, fly, cells, zone, cross, check, spans, terminal } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const at = (c, j, a = 0.2, d = 0.7) => (c.k > j ? 1 : c.k === j ? E(c.u, a, a + d) : 0);
  const pp = (c, j, a = 0.2) => (c.k > j ? 1 : c.k === j ? pop(c.u, a) : 0);
  // 2D 격자: vals[r][i], o.style(r, i, v) → {s, stroke, fill, color, op}
  function grid(x, y, vals, o) { o = o || {}; const w = o.w || 50, h = o.h || 40, g = o.gap ?? 4;
    vals.forEach((rw, r) => cells(x, y + r * (h + g), rw, { w, h, gap: g, fs: o.fs || 15, style: o.style ? (i, v) => o.style(r, i, v) : null }));
    return { w: vals[0].length * (w + g) - g, h: vals.length * (h + g) - g }; }
  const shp = (cx, cy, s, col, sc, o) => pill(cx, cy, s, col || MUT, sc, Object.assign({ mono: true, fs: 14 }, o || {}));
  const A = [['0.', '1.', '2.'], ['3.', '4.', '5.']], ONES = [['1.', '1.', '1.'], ['1.', '1.', '1.']];
  // 블록 행렬 (칸 크기 cs): rows×cols, o.hiRow / o.hiCol 강조
  function block(x, y, rows, cols, cs, col, o) { o = o || {};
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const hi = o.hiRow === r || o.hiCol === q;
      el('rect', { x: x + q * cs, y: y + r * cs, width: cs - 3, height: cs - 3, rx: 3, fill: hi ? col : o.fill || SOFT, opacity: (hi ? 0.75 : 1) * (o.op ?? 1), stroke: col, 'stroke-width': 1.4 }); } }

  // =========================================================
  // 1. 연산 세 부류 — 요소별 · 행렬곱 · 집계(dim)
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    if (k <= 1) {
      mono(80, 92, 'a = arange(6.).reshape(2,3)', { 'font-size': 14.5, 'font-weight': 700, opacity: at(c, 0, 0.1) });
      grid(80, 110, A, { w: 54, style: (r, i) => ({ s: pp(c, 0, 0.2 + (r * 3 + i) * 0.06), stroke: k === 1 && Math.floor(u / 0.3) === r * 3 + i + 1 ? WARN : INK }) });
      shp(162, 222, '(2, 3)', MUT, pp(c, 0, 0.8));
      mono(380, 92, 'b = torch.ones(2, 3)', { 'font-size': 14.5, 'font-weight': 700, opacity: at(c, 0, 0.9) });
      grid(380, 110, ONES, { w: 54, style: (r, i) => ({ s: pp(c, 0, 1.0 + (r * 3 + i) * 0.06), stroke: k === 1 && Math.floor(u / 0.3) === r * 3 + i + 1 ? WARN : INK }) });
      shp(462, 222, '(2, 3)', MUT, pp(c, 0, 1.5));
      if (k === 0) { sub(480, 320, '두 텐서 모두 (2, 3). 모양부터 적어 둔다', fade(u, 1.9), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      tx(335, 160, '+', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
      tx(630, 160, '=', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.1) });
      const S = [['1.', '2.', '3.'], ['4.', '5.', '6.']];
      grid(680, 110, S, { w: 54, style: (r, i) => ({ s: u > 0.3 * (r * 3 + i + 1) ? 1 : 0, stroke: ACC, fill: ACCBG }) });
      shp(762, 222, '(2, 3)', ACC, pop(u, 2.0));
      mono(80, 300, 'a * b', { 'font-size': 16, 'font-weight': 800, fill: WARN, opacity: fade(u, 2.0) });
      cells(170, 280, ['0.', '1.', '2.', '3.', '4.', '5.'], { w: 46, h: 34, gap: 4, style: () => ({ s: fade(u, 2.1), stroke: WARN }) });
      tx(480, 365, '* 도 같은 자리끼리 곱한다. 행렬곱이 아니다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) });
      return; }
    if (k === 2 || k === 3) { const bad = k === 3, cs = 34, ax = 90, ay = 150, wx = 330, wy = 116;
      mono(480, 60, bad ? 'a @ b   (2,3) @ (2,3)' : 'a @ w   (2,3) @ (3,4) → (2,4)', { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: bad ? BAD : INK, opacity: fade(u, 0.1) });
      block(ax, ay, 2, 3, cs, INK, { hiRow: !bad && u > 0.9 && u < 2.0 ? 0 : null });
      tx(ax + 50, ay + 92, 'a  (2, 3)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 });
      block(wx, wy, bad ? 2 : 3, bad ? 3 : 4, cs, bad ? BAD : INFO, { hiCol: !bad && u > 0.9 && u < 2.0 ? 0 : null });
      tx(wx + (bad ? 50 : 66), wy + (bad ? 92 : 126), bad ? 'b  (2, 3)' : 'w  (3, 4)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: bad ? BAD : INFO });
      // 안쪽 차원 비교
      const ok = !bad, col = ok ? GOOD : BAD;
      pill(ax + 50, ay - 26, '열 3', col, pop(u, 0.4), { fs: 14 });
      pill(wx - 40, wy + (bad ? 33 : 50), bad ? '행 2' : '행 3', col, pop(u, 0.6), { fs: 14 });
      if (ok) { tx(250, 300, '안쪽 3 = 3 → 사라진다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.0) });
        tx(560, 165, '=', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
        block(620, 150, 2, 4, cs, ACC, { op: fade(u, 1.3), fill: ACCBG });
        if (u > 0.9 && u < 2.0) el('rect', { x: 620, y: 150, width: cs - 3, height: cs - 3, rx: 3, fill: ACC });
        tx(688, 242, '결과  (2, 4)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
        tx(480, 360, '(m, k) @ (k, n) → (m, n) : 바깥 두 수만 남는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }
      else { cross(560, 165, 18, pop(u, 1.0));
        card(480, 330, 640, 50, { rx: 10, fill: BADBG, stroke: BAD, sw: 2, s: pop(u, 1.3) });
        mono(480, 336, 'mat1 and mat2 shapes cannot be multiplied (2x3 and 2x3)', { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.4) });
        tx(480, 392, '요소별로는 되는 모양도 행렬곱에서는 안쪽 3 ≠ 2 라 실패한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); }
      return; }
    if (k === 4) { const gx = 330, gy = 90;
      tx(gx - 16, gy + 48, '축0 ↓', { 'text-anchor': 'end', 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(gx + 80, gy - 12, '축1 →', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700 });
      grid(gx, gy, A, { w: 54 });
      // dim=0: 열마다 아래로 모인다
      [0, 1, 2].forEach((i) => { const x = gx + i * 58 + 27; grow(x, gy + 92, x, 236, E(u, 0.3, 0.8), WARN); });
      cells(gx, 240, ['3.', '5.', '7.'], { w: 54, h: 40, style: () => ({ s: pop(u, 0.8), stroke: WARN, fill: WARNBG }) });
      mono(gx + 80, 304, 'sum(dim=0) → (3,)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.0) });
      // dim=1: 행마다 오른쪽으로
      [0, 1].forEach((r) => { const y = gy + r * 44 + 20; grow(gx + 168, y, 560, y, E(u, 1.1, 1.6), INFO); });
      cells(566, gy, ['3.'], { w: 54, h: 40, style: () => ({ s: pop(u, 1.6), stroke: INFO, fill: INFOBG }) });
      cells(566, gy + 44, ['12.'], { w: 54, h: 40, style: () => ({ s: pop(u, 1.6), stroke: INFO, fill: INFOBG }) });
      mono(700, gy + 48, 'sum(dim=1) → (2,)', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) });
      card(150, 200, 120, 60, { rx: 30, text: 'sum() → 15.', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 2.0) });
      tx(480, 380, 'dim=k 는 "k번 축이 사라진다" 로 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k5: keepdim → (2,1), a - m
    grid(80, 110, A, { w: 54 }); shp(162, 222, 'a (2, 3)', MUT, 1);
    tx(270, 160, '−', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.1) });
    cells(300, 110, ['1.'], { w: 54, h: 40, style: () => ({ s: pop(u, 0.2), stroke: WARN, fill: WARNBG }) });
    cells(300, 154, ['4.'], { w: 54, h: 40, style: () => ({ s: pop(u, 0.2), stroke: WARN, fill: WARNBG }) });
    shp(327, 222, 'm (2, 1)', WARN, pop(u, 0.4));
    [1, 2].forEach((q) => [0, 1].forEach((r) => { const g = E(u, 0.6 + q * 0.35, 0.9 + q * 0.35); if (g > 0) card(300 + 27 + 58 * q, 130 + r * 44, 54 * (0.5 + 0.5 * g), 40, { rx: 6, text: r ? '4.' : '1.', fs: 15, mono: true, stroke: WARN, dash: '4 3', op: 0.55 * g }); }));
    tx(530, 160, '=', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
    grid(580, 110, [['-1.', '0.', '1.'], ['-1.', '0.', '1.']], { w: 54, style: () => ({ s: pop(u, 1.6), stroke: ACC, fill: ACCBG }) });
    shp(662, 222, '(2, 3)', ACC, pop(u, 1.8));
    mono(80, 300, 'm = a.mean(dim=1, keepdim=True)', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) });
    tx(480, 370, '축을 크기 1 로 남겨 두면 다음 줄에서 바로 되돌릴 수 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); }

  // =========================================================
  // 2. 브로드캐스팅 — 뒤에서부터 맞추고, 1 은 늘어난다
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    if (k <= 1) { const cx0 = 90, ry = 66, gx = 170, gy = 122, w = 62, h = 44;
      const ROW = ['10.', '20.', '30.', '40.'], COL = ['1.', '2.', '3.'];
      cells(gx, ry, ROW, { w, h, gap: 4, style: (i) => ({ s: pp(c, 0, 0.2 + i * 0.08), stroke: INFO, fill: INFOBG }) });
      tx(gx + 4 * 66 + 10, ry + 28, 'row (1, 4)', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: at(c, 0, 0.4) });
      COL.forEach((v, r) => cells(cx0, gy + r * 48, [v], { w: 62, h, style: () => ({ s: pp(c, 0, 0.5 + r * 0.08), stroke: WARN, fill: WARNBG }) }));
      tx(cx0 + 31, gy + 3 * 48 + 22, 'col (3, 1)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: at(c, 0, 0.7) });
      // 결과 표: 칸이 채워진다
      COL.forEach((a, r) => ROW.forEach((b, q) => { const s = c.k > 0 ? 1 : E(u, 0.9 + (r + q) * 0.12, 1.3 + (r + q) * 0.12); if (s <= 0) return;
        card(gx + q * 66 + w / 2, gy + r * 48 + h / 2, w, h, { rx: 6, text: (parseFloat(a) + parseFloat(b)) + '.', fs: 15, mono: true, stroke: ACC, fill: ACCBG, op: s }); }));
      shp(gx + 130, gy + 3 * 48 + 20, '(3, 4)', ACC, pp(c, 0, 1.9));
      if (k === 0) { tx(720, 200, '원소 수가 달라도', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 2.1) });
        tx(720, 226, '(3, 4) 로 통과했다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.2) }); return; }
      // k1: 오른쪽 정렬 표
      const X1 = 640, X2 = 760, Y0 = 120;
      tx(X1, Y0 - 30, '축 0', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.2) }); tx(X2, Y0 - 30, '축 1', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.2) });
      [['3', '1'], ['1', '4']].forEach(([a, b], r) => { const y = Y0 + r * 46, col = r ? INFO : WARN;
        tx(560, y + 5, r ? 'row' : 'col', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: col, opacity: fade(u, 0.3 + r * 0.2) });
        mono(X1, y + 6, a, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + r * 0.2) });
        mono(X2, y + 6, b, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + r * 0.2) }); });
      el('line', { x1: 590, y1: Y0 + 74, x2: 810, y2: Y0 + 74, stroke: INK, 'stroke-width': 2, opacity: fade(u, 0.8) });
      mono(X1, Y0 + 108, '3', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) }); mono(X2, Y0 + 108, '4', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      tx(X1, Y0 + 136, '3 vs 1', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.1) }); tx(X2, Y0 + 136, '1 vs 4', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 1.5) });
      tx(700, 330, '같거나 한쪽이 1 이면 통과', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) });
      tx(700, 356, '1 인 쪽이 늘어난다 (복사는 없다)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    if (k === 2) { const w = 46, h = 32;
      mono(480, 50, 'x - x.mean(dim=1, keepdim=True)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.1) });
      const blank = Array.from({ length: 5 }, () => ['', '', '']);
      grid(110, 80, blank, { w, h, style: (r, i) => ({ s: pop(u, 0.2 + r * 0.05), fill: SOFT }) }); shp(183, 280, 'x (5, 3)', MUT, pop(u, 0.4));
      tx(290, 165, '−', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.5) });
      for (let r = 0; r < 5; r++) cells(330, 80 + r * 36, ['μ'], { w, h, style: () => ({ s: pop(u, 0.6 + r * 0.05), stroke: WARN, fill: WARNBG }) });
      shp(353, 280, '(5, 1)', WARN, pop(u, 0.8));
      for (let q = 1; q < 3; q++) for (let r = 0; r < 5; r++) { const g = E(u, 0.7 + q * 0.35, 1.0 + q * 0.35); if (g > 0) card(353 + 50 * q, 96 + r * 36, w * (0.5 + 0.5 * g), h, { rx: 6, text: 'μ', fs: 15, stroke: WARN, dash: '4 3', op: 0.5 * g }); }
      tx(540, 165, '=', { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      grid(580, 80, blank, { w, h, style: () => ({ s: pop(u, 1.7), stroke: ACC, fill: ACCBG }) }); shp(653, 280, '(5, 3)', ACC, pop(u, 1.9));
      tx(480, 350, '행마다 평균을 빼는 정규화가 한 줄이 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k3~5: (N,) 과 (N,1)
    const P = ['p₀', 'p₁', 'p₂', 'p₃'], T = ['t₀', 't₁', 't₂', 't₃'];
    mono(60, 64, 'pred', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: at(c, 3, 0.1) });
    cells(120, 42, P, { w: 52, h: 38, gap: 4, style: (i) => ({ s: pp(c, 3, 0.2 + i * 0.06), stroke: INFO, fill: INFOBG }) }); shp(370, 61, '(4,)', INFO, pp(c, 3, 0.5));
    const sq = k === 5 ? E(u, 0.3, 1.1) : 0;   // target 이 세워진 열 → 누운 줄
    mono(60, 128, 'target', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: at(c, 3, 0.6) });
    T.forEach((v, i) => { const x = lerp(120, 120 + i * 56, sq), y = lerp(108 + i * 42, 108, sq);
      card(x + 26, y + 19, 52, 38, { rx: 6, text: v, fs: 15, mono: true, stroke: WARN, fill: WARNBG, s: pp(c, 3, 0.7 + i * 0.06) }); });
    shp(sq > 0.5 ? 370 : 210, sq > 0.5 ? 127 : 190, sq > 0.5 ? '(4,)' : '(4, 1)', WARN, pp(c, 3, 1.0));
    if (k === 3) { tx(560, 210, '값은 4개씩으로 같아 보인다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(560, 238, '차원 수는 1 과 2 로 다르다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    // 4x4 폭발
    const GX = 520, GY = 100, op4 = k === 5 ? 0.25 : 1;
    mono(GX, 74, k === 4 ? 'diff = pred - target' : 'diff (잘못된 것)', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: (k === 4 ? fade(u, 0.1) : 1) * op4 });
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) { const s = k === 4 ? E(u, 0.5 + (r + q) * 0.1, 0.9 + (r + q) * 0.1) : 1; if (s <= 0) continue;
      card(GX + q * 74 + 35, GY + r * 46 + 21, 70, 42, { rx: 6, text: `p${q}−t${r}`, fs: 14, mono: true, stroke: r === q ? INK : BAD, fill: r === q ? PANEL : BADBG, sw: r === q ? 2.6 : 1.6, op: s * op4 }); }
    if (k === 4) { shp(GX + 148, GY + 204, '(4, 4)  에러 없음', BAD, pop(u, 1.4));
      tx(250, 300, '(4,) → (1, 4) 로 정렬되어', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) });
      tx(250, 326, '(4, 1) 과 만나 (4, 4) 가 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) });
      tx(250, 362, '원하던 값은 대각선 4칸뿐', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.2) }); return; }
    mono(60, 300, 'target.squeeze(1)', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 0.3) });
    mono(60, 352, 'diff_ok', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
    cells(140, 330, ['p₀−t₀', 'p₁−t₁', 'p₂−t₂', 'p₃−t₃'], { w: 76, h: 40, gap: 4, style: (i) => ({ s: pop(u, 1.3 + i * 0.08), stroke: ACC, fill: ACCBG }) });
    shp(500, 350, '(4,)', ACC, pop(u, 1.8)); if (u > 1.9) check(560, 350, 12, pop(u, 1.9)); }

  // =========================================================
  // 3. 모양 바꾸기 도구함
  // =========================================================
  function s3(t, c) { const { k, u } = c;
    if (k === 0) { const v = Array.from({ length: 12 }, (_, i) => i);
      const s0 = E(u, 0.2, 0.6); cells(140, 56, v, { w: 50, h: 38, gap: 6, style: () => ({ s: s0, stroke: INK }) }); shp(870, 75, '(12,)', MUT, pop(u, 0.4));
      const f = E(u, 0.8, 1.5);
      v.forEach((n, i) => { const r = Math.floor(i / 4), q = i % 4, x = lerp(140 + i * 56 + 25, 100 + q * 54 + 25, f), y = lerp(150, 150 + r * 44 + 19, f);
        if (f > 0) card(x, y, 50, 38, { rx: 6, text: String(n), fs: 15, mono: true, stroke: ACC, fill: ACCBG, op: f }); });
      tx(208, 300, 'view(3, 4)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5), class: 'mono' });
      [0, 1].forEach((sl) => grid(480 + sl * 190, 150 + sl * 0, [[0, 1, 2].map((q) => String(sl * 6 + q)), [3, 4, 5].map((q) => String(sl * 6 + q))], { w: 50, h: 38, style: () => ({ s: pop(u, 1.6 + sl * 0.2), stroke: INFO, fill: INFOBG }) }));
      tx(645, 260, 'reshape(2, 2, 3)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.9), class: 'mono' });
      tx(480, 360, 'view(-1) 은 남은 크기를 알아서 12 로 채운다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { const f = E(u, 0.6, 1.4);
      ['·', '·', '·', '·'].forEach((s, i) => card(lerp(200, 380 + i * 56, f), lerp(100 + i * 44, 180, f), 50, 38, { rx: 6, text: 'y' + i, fs: 15, mono: true, stroke: ACC, fill: ACCBG }));
      mono(200, 70, 'y = torch.randn(4, 1)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
      spans(560, 290, [['(4, ', { fill: INK }], ['1', { fill: BAD, 'text-decoration': u > 1.0 ? 'line-through' : null }], [')', { fill: INK }]], { 'font-size': 22, 'font-weight': 800, opacity: 1 - E(u, 1.4, 1.8) });
      mono(560, 290, '(4,)', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: E(u, 1.5, 1.9) });
      mono(560, 250, 'y.squeeze(1)', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.4) });
      tx(480, 370, '크기 1 인 축만 뺀다. (N,1) 함정을 푸는 도구', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { const cx = 300, cy = 190, S = 120, bw = E(u, 1.0, 1.6);
      [WARN, GOOD, INFO].forEach((col, i) => { const d = (2 - i) * 18; el('rect', { x: cx - S / 2 + d, y: cy - S / 2 - d, width: S, height: S, rx: 6, fill: PANEL, stroke: col, 'stroke-width': 2.5, opacity: fade(u, 0.2 + i * 0.15) }); });
      tx(cx + 18, cy + 5, '32 × 32', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(cx - 70, cy + S / 2 + 30, 'C = 3', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
      if (bw > 0) { el('rect', { x: cx - S / 2 - 30, y: cy - S / 2 - 66, width: (S + 96) * bw, height: S + 116, rx: 14, fill: 'none', stroke: ACC, 'stroke-width': 3, 'stroke-dasharray': '7 5' });
        pill(cx - S / 2 - 30, cy - S / 2 - 66, '배치 1', ACC, pop(u, 1.4), { fs: 14 }); }
      mono(680, 150, 'img          (3, 32, 32)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      mono(680, 200, 'img.unsqueeze(0)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      mono(680, 240, '(1, 3, 32, 32)', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.7) });
      tx(680, 300, '모델은 맨 앞 배치 축을 요구한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k === 3) { const ax = [['H', '32'], ['W', '32'], ['C', '3']], to = [1, 2, 0], f = E(u, 0.7, 1.7);
      mono(480, 70, 'hwc.permute(2, 0, 1)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 0.1) });
      [0, 1, 2].forEach((i) => tx(300 + i * 180, 128, `${i}번`, { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.2) }));
      ax.forEach(([n, s], i) => { const x = lerp(300 + i * 180, 300 + to[i] * 180, f), lift = Math.sin(Math.PI * f) * (i === 2 ? -50 : 30);
        const col = n === 'C' ? WARN : INFO; card(x, 190 + lift, 120, 74, { rx: 12, stroke: col, fill: n === 'C' ? WARNBG : INFOBG, sw: 2.5 });
        tx(x, 186 + lift, n, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: col }); mono(x, 210 + lift, s, { 'text-anchor': 'middle', 'font-size': 15, fill: col }); });
      mono(300, 280, '(32, 32, 3)', { 'font-size': 16, 'text-anchor': 'middle', fill: MUT, opacity: 1 - f });
      mono(480, 290, '(H, W, C) → (C, H, W) = (3, 32, 32)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.8) });
      tx(480, 360, '값은 그대로 두고 읽는 순서만 바꾼다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    // k4·5: 메모리 순서
    const lab = ['R', 'G', 'B'], col = [WARN, GOOD, INFO], X0 = 100, Y0 = 100, cw = 56;
    tx(X0, Y0 - 16, '메모리 (hwc 그대로): 픽셀마다 R G B', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    for (let i = 0; i < 12; i++) card(X0 + i * (cw + 6) + cw / 2, Y0 + 20, cw, 40, { rx: 6, text: lab[i % 3] + Math.floor(i / 3), fs: 14, mono: true, stroke: col[i % 3] });
    if (k === 4) { // chw 로 읽으면 3칸씩 건너뛴다
      const hop = E(u, 0.3, 1.5);
      [0, 3, 6].forEach((i, j) => { if (hop * 3 > j) { const x1 = X0 + i * 62 + 28, x2 = X0 + (i + 3) * 62 + 28;
        el('path', { d: `M${x1},${Y0} Q${(x1 + x2) / 2},${Y0 - 40} ${x2},${Y0}`, fill: 'none', stroke: WARN, 'stroke-width': 2.4, opacity: 0.9 }); } });
      mono(X0, 196, 'chw.stride() = (1, 96, 3)  → is_contiguous() = False', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.4) });
      pill(220, 250, 'chw.view(-1)', BAD, pop(u, 1.7), { mono: true, fs: 15 }); cross(320, 250, 12, pop(u, 1.9));
      card(480, 320, 820, 50, { rx: 10, fill: BADBG, stroke: BAD, sw: 2, s: pop(u, 2.0) });
      mono(480, 326, "view size is not compatible with input tensor's size and stride", { 'text-anchor': 'middle', 'font-size': 14.5, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    // k5: contiguous 로 새로 줄 세운다
    tx(X0, 196, 'chw.contiguous(): 새 메모리에 C, H, W 순서로 복사', { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
    const ord = [0, 3, 6, 9, 1, 4, 7, 10, 2, 5, 8, 11];
    ord.forEach((src, i) => { const s = E(u, 0.3 + i * 0.07, 0.6 + i * 0.07); if (s <= 0) return;
      card(X0 + i * (cw + 6) + cw / 2, 240, cw, 40, { rx: 6, text: lab[src % 3] + Math.floor(src / 3), fs: 14, mono: true, stroke: col[src % 3], fill: ACCBG, op: s }); });
    grow(X0 + 10, 280, X0 + 11 * 62 + 46, 280, E(u, 1.4, 2.0), ACC);
    mono(480, 330, 'flat = chw.contiguous().view(-1)   →   (3072,)  = 3 × 32 × 32', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.0) });
    tx(480, 380, 'reshape 는 필요하면 이 복사를 알아서 한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); }

  // =========================================================
  // 4. 에러 메시지 숫자를 역추적한다
  // =========================================================
  function mat(x, y, w, h, top, left, col, op, o) { o = o || {};
    el('rect', { x, y, width: w, height: h, rx: 6, fill: o.fill || SOFT, stroke: col, 'stroke-width': 2.4, opacity: op });
    for (let i = 1; i < 6; i++) el('line', { x1: x, y1: y + (h * i) / 6, x2: x + w, y2: y + (h * i) / 6, stroke: col, 'stroke-width': 0.8, opacity: 0.4 * op });
    if (top) mono(x + w / 2, y - 10, top, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: o.topCol || col, opacity: op });
    if (left) mono(x - 10, y + h / 2 + 5, left, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: o.leftCol || col, opacity: op }); }
  function s4(t, c) { const { k, u } = c;
    if (k <= 3) {
      // x (32, 784)
      mat(80, 110, 260, 120, '784', '32', INK, at(c, 0, 0.2), { topCol: WARN });
      tx(210, 262, 'x  (32, 784)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: at(c, 0, 0.4) });
      if (k === 0) { // 28x28 가 펴진다
        const f = E(u, 0.9, 1.7);
        for (let r = 0; r < 7; r++) for (let q = 0; q < 7; q++) { const i = r * 7 + q;
          el('rect', { x: lerp(560 + q * 14, 420 + i * 9.6, f), y: lerp(90 + r * 14, 300, f), width: lerp(12, 8, f), height: 12, fill: (r + q) % 3 ? INFO : ACC, opacity: 0.6 }); }
        tx(610, 80, '28 × 28 이미지', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
        tx(660, 340, '펴면 784 칸', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.8) });
        pill(210, 62, '32 = 배치 (한 번에 32장)', GOOD, pop(u, 1.2), { fs: 14 }); return; }
      const good = k === 3, inn = good ? '784' : '100';
      mat(470, good ? 80 : 120, 70, good ? 230 : 120, '10', inn, good ? ACC : BAD, at(c, 1, 0.2), { leftCol: good ? ACC : BAD, topCol: INK });
      mono(505, good ? 336 : 270, good ? 'Linear(784, 10)' : 'Linear(100, 10)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: good ? ACC : BAD, opacity: at(c, 1, 0.4) });
      if (k === 1) { pill(700, 150, '100 = in_features', BAD, pop(u, 0.8), { mono: true, fs: 14 }); pill(700, 190, '10 = out_features', INK, pop(u, 1.1), { mono: true, fs: 14 });
        tx(700, 240, '입력을 보지 않고 100 을 적었다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) }); return; }
      if (k === 2) { cross(405, 170, 16, pop(u, 0.5));
        card(480, 340, 820, 52, { rx: 10, fill: BADBG, stroke: BAD, sw: 2, s: pop(u, 0.8) });
        spans(108, 346, [['mat1 and mat2 shapes cannot be multiplied (', { fill: INK }], ['32', { fill: GOOD, 'font-weight': 800 }], ['x', { fill: INK }], ['784', { fill: WARN, 'font-weight': 800 }], [' and ', { fill: INK }], ['100', { fill: BAD, 'font-weight': 800 }], ['x', { fill: INK }], ['10', { fill: INK, 'font-weight': 800 }], [')', { fill: INK }]], { 'font-size': 15, opacity: fade(u, 1.0) });
        tx(740, 160, '안쪽 두 수', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) });
        mono(740, 188, '784 ≠ 100', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.7) });
        tx(740, 220, '바깥 32 · 10 은 원인이 아니다', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
      check(405, 170, 14, pop(u, 0.5));
      tx(405, 140, '784 = 784', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.6), class: 'mono' });
      tx(600, 175, '=', { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      mat(650, 110, 70, 120, '10', '32', ACC, fade(u, 1.2), { fill: ACCBG });
      mono(780, 262, '(32, 10)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      tx(480, 390, '고칠 곳은 안쪽이 안 맞는 쪽 하나다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k4~6: CNN → FC
    const stack = (cx, cy, n, s, col, op) => { for (let i = n - 1; i >= 0; i--) el('rect', { x: cx - s / 2 + i * 6, y: cy - s / 2 - i * 6, width: s, height: s, rx: 4, fill: PANEL, stroke: col, 'stroke-width': 1.8, opacity: op }); };
    if (k === 4) { stack(150, 200, 3, 80, INK, fade(u, 0.2)); mono(160, 290, '(32, 3, 10, 10)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) });
      grow(240, 200, 380, 200, E(u, 0.5, 1.0), MUT); pill(310, 172, 'Conv2d(3, 16, 3)', INK, pop(u, 0.6), { mono: true, fs: 14 });
      stack(500, 220, 8, 64, ACC, fade(u, 1.0)); tx(500, 136, '16 채널 × 8 × 8', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.2) });
      mono(520, 300, '(32, 16, 8, 8)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      card(780, 210, 220, 70, { rx: 10, stroke: BAD, dash: '6 4', text: 'Linear 는 (B, F)\n2차원을 원한다', fs: 15, color: BAD, s: pop(u, 1.9) }); return; }
    if (k === 5) { const f = E(u, 0.3, 1.3);
      stack(150, 200, 8, 64, ACC, 1 - f); mono(150, 290, '(32, 16, 8, 8)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: 1 - f * 0.7 });
      for (let i = 0; i < 16; i++) el('rect', { x: lerp(150, 130 + i * 44, f), y: lerp(200, 170, f), width: 40, height: 30, rx: 4, fill: ACCBG, stroke: ACC, 'stroke-width': 1.5, opacity: f });
      for (let i = 0; i < 16; i++) if (f > 0.9) mono(150 + i * 44, 190, '64', { 'text-anchor': 'middle', 'font-size': 13.5, fill: ACC, opacity: fade(u, 1.3) });
      mono(480, 90, 'feat.flatten(start_dim=1)', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
      mono(480, 260, '16 × 8 × 8 = 1024   →   (32, 1024)', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
      tx(480, 330, 'start_dim=1 을 빼면 배치까지 펴져 (32768,) 이 된다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 2.0) }); return; }
    // k6: 전체 사슬
    const ch = [['(32,3,10,10)', INK], ['(32,16,8,8)', INK], ['(32,1024)', ACC], ['(32,10)', ACC]], ops = ['conv', 'flatten', 'Linear(1024,10)'];
    ch.forEach(([s, col], i) => { const x = 110 + i * 246; card(x, 180, 160, 50, { rx: 10, text: s, fs: 15, mono: true, stroke: col, color: col, s: pop(u, 0.2 + i * 0.4) });
      if (i < 3) { grow(x + 82, 180, x + 164, 180, E(u, 0.4 + i * 0.4, 0.7 + i * 0.4), MUT); mono(x + 123, 160 - (i === 2 ? 10 : 0), ops[i], { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); } });
    pill(602, 250, 'flatten 뒤 크기 = 다음 Linear 의 in_features', ACC, pop(u, 1.8), { fs: 15 });
    tx(480, 330, 'Linear(16*8*8, 10) 처럼 곱을 그대로 적어 두면 검산이 쉽다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); }

  // =========================================================
  // 5. 디버깅 루틴 — 관측 지점 · assert · 이름 붙인 축 · 배치 0번
  // =========================================================
  const OUT = ['입력: torch.Size([32, 3, 10, 10])', 'conv 후: torch.Size([32, 16, 8, 8])', 'flatten 후: torch.Size([32, 1024])', '최종: torch.Size([32, 10])'];
  function s5(t, c) { const { k, u } = c;
    const B = [['x', 90], ['conv', 300], ['flatten', 510], ['fc', 720], ['out', 890]];
    B.forEach(([n, x], i) => { card(x, 70, n === 'flatten' ? 100 : 78, 40, { rx: 8, text: n, fs: 15, mono: true, stroke: INK });
      if (i < 4) grow(x + (n === 'flatten' ? 52 : 41), 70, B[i + 1][0] === 'flatten' ? B[i + 1][1] - 52 : B[i + 1][1] - 41, 70, 1, OFF); });
    // 관측 지점
    const probe = (x, j, col, lab) => { const s = pp(c, j, 0.2); if (s <= 0) return; el('line', { x1: x, y1: 92, x2: x, y2: 120, stroke: col, 'stroke-width': 2.4, opacity: Math.min(1, s) }); pill(x, 130, lab, col, s, { mono: true, fs: 13.5 }); };
    probe(170, 0, INFO, 'print'); probe(400, 1, INFO, 'print'); probe(620, 2, GOOD, 'assert'); probe(812, 5, GOOD, 'assert');
    const shown = k <= 2 ? k + E(u, 0.4, 1.2) : k < 5 ? 3 : 3 + E(u, 0.8, 1.6);
    terminal(40, 170, 500, 200, OUT.slice(0, 4), Math.max(0.01, shown), { title: 'python shape_debug.py', fs: 14.5, lh: 30 });
    if (k === 0) { tx(740, 260, '값이 아니라 모양을 본다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.6) }); return; }
    if (k === 1) { tx(740, 240, '관측 지점이 둘이면', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.5) });
      tx(740, 268, '어긋난 구간이 절반으로 준다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); return; }
    if (k === 2) { card(750, 250, 340, 80, { rx: 10, stroke: GOOD, fill: GOODBG, sw: 2, s: pop(u, 0.4) });
      mono(600, 242, 'assert flat.shape == (32, 1024)', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 0.5) });
      tx(600, 270, '틀리면 곱셈 전에 이 줄에서 멈춘다', { 'font-size': 14, fill: INK, opacity: fade(u, 1.2) }); if (u > 1.7) check(900, 250, 13, pop(u, 1.7)); return; }
    if (k === 3) { const L = ['b', 'c', 'h', 'w'], col = [ACC, INFO, INFO, INFO];
      tx(740, 196, 'einops rearrange', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.1) });
      L.forEach((s, i) => card(620 + i * 80, 240, 56, 44, { rx: 8, text: s, fs: 20, mono: true, stroke: col[i], color: col[i], s: pop(u, 0.2 + i * 0.1) }));
      L.forEach((s, i) => { if (i) grow(620 + i * 80, 264, lerp(620 + i * 80, 780, 0.6), 320, E(u, 0.9, 1.4), INFO); });
      grow(620, 264, 620, 316, E(u, 0.9, 1.4), ACC);
      card(620, 340, 56, 44, { rx: 8, text: 'b', fs: 20, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.4) });
      card(780, 340, 160, 44, { rx: 8, text: '(c h w)', fs: 20, mono: true, stroke: INFO, color: INFO, s: pop(u, 1.5) });
      tx(740, 400, '축 번호 대신 이름으로 읽힌다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    // k4·5: 배치는 0번
    const SH = ['(32, 3, 10, 10)', '(32, 16, 8, 8)', '(32, 1024)', '(32, 10)'];
    el('rect', { x: 598, y: 176, width: 46, height: 156, rx: 8, fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: at(c, 4, 0.6) });
    SH.forEach((s, i) => mono(600, 200 + i * 38, s, { 'font-size': 18, 'font-weight': 700, fill: INK, opacity: at(c, 4, 0.2 + i * 0.1) }));
    tx(621, 360, 'dim 0', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: at(c, 4, 0.8) });
    if (k === 4) { tx(760, 400, '층·손실·로더가 모두 이 규약을 깔고 있다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) }); return; }
    mono(600, 400, 'assert out.shape[0] == batch_size', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.6) }); if (u > 2.0) check(900, 352, 13, pop(u, 2.0)); }

  const quiz = [
    { q: 'a가 (2,3), w가 (3,4)일 때 a @ w의 shape는 무엇인가?',
      o: ['(2, 4)', '(3, 3)', '에러가 난다'], a: 0,
      why: '행렬곱은 안쪽 3이 맞아 사라지고 바깥 2·4가 남는다. 같은 (2,3)끼리 a @ b를 하면 안쪽 3 ≠ 2라 실패한다.' },
    { q: '(4,) 예측에서 (4,1) 정답을 빼면 결과 shape는 무엇인가?',
      o: ['(4,)', 'RuntimeError', '(4, 4)'], a: 2,
      why: '(4,)가 (1,4)로 정렬되어 (4,1)과 만나 (4,4)가 된다. 규칙상 합법이라 에러가 나지 않는다.' },
    { q: 'permute(2,0,1) 직후 view(-1)이 실패하는 이유는 무엇인가?',
      o: ['원소 개수가 바뀌어서', '메모리가 비연속(non-contiguous)이라서', 'permute가 값을 복사해서'], a: 1,
      why: 'permute는 값은 그대로 두고 읽는 순서(stride)만 바꾼다. .contiguous()로 다시 줄 세우거나 reshape를 쓴다.' },
    { q: '"(32x784 and 100x10)" 에러에서 고쳐야 할 숫자는 무엇인가?',
      o: ['Linear의 in_features 100', '배치 32', '출력 클래스 수 10'], a: 0,
      why: '안쪽 784와 100이 달라 생긴 에러다. 입력 특징 수에 맞춰 Linear(784, 10)으로 고친다.' },
    { q: 'assert flat.shape == (32, 1024)를 넣어 두면 좋은 점은 무엇인가?',
      o: ['학습이 빨라진다', 'flatten을 자동으로 고쳐 준다', 'shape가 틀리면 곱셈 지점이 아니라 그 줄에서 바로 멈춘다'], a: 2,
      why: '예상을 코드에 남겨 두면 원인 위치가 분명해진다. print는 지나가지만 assert는 남아서 다음 사람까지 지킨다.' },
  ];

  const summary = [
    '* 는 같은 자리끼리 계산하고 @ 는 안쪽 차원이 맞아야 하는 행렬곱이다.',
    'sum(dim=k)은 k번 축을 지운다. keepdim=True면 크기 1로 남아 다시 빼기 쉽다.',
    '브로드캐스팅은 뒤에서부터 맞추고 1을 늘린다. (4,)와 (4,1)을 빼면 (4,4)가 된다.',
    '행렬곱 에러는 안쪽 두 수를 본다. flatten 크기가 다음 Linear의 in_features다.',
  ];
  const review = [
    { q: '회귀 모델의 손실이 이상하게 작고 학습이 안 된다. pred는 (64,), target은 (64,1)이다. 먼저 할 일은?',
      o: ['학습률을 낮춘다', 'target.squeeze(1)로 두 shape를 맞춘다', 'Linear의 out_features를 64로 바꾼다'], a: 1,
      why: '(64,) - (64,1)은 에러 없이 (64,64)가 되어 엉뚱한 값의 평균을 낸다. 예측과 정답 shape를 한쪽으로 통일한다.' },
    { q: 'Conv 뒤에 Linear(1000, 10)을 붙였더니 "(32x1024 and 1000x10)" 에러가 났다. 알맞은 수정은?',
      o: ['Linear(1024, 10)으로 바꾼다', '배치 크기를 1000으로 바꾼다', 'flatten을 빼고 그대로 넣는다'], a: 0,
      why: 'flatten 결과 (32,1024)의 1024가 in_features 여야 한다. 16×8×8처럼 곱을 그대로 적으면 실수가 준다.' },
    { q: '(H,W,C) 이미지를 permute로 (C,H,W)로 바꾼 뒤 한 줄로 펴려 한다. 안전한 코드는?',
      o: ['x.view(-1)', 'x.squeeze(0)', 'x.reshape(-1)'], a: 2,
      why: 'permute 뒤에는 메모리가 비연속이라 view가 거부된다. reshape는 필요하면 복사해서 펴 준다.' },
  ];

  R.page({ title: 'shape 따라가기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
