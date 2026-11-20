/* III-2-1 차원 축소 — PCA · t-SNE · UMAP · 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 타원 점과 나선 점은 페이지의 ELLIPSE_POINTS · SPIRAL_POINTS 를 그대로 쓴다. 비율·설명력은 beat 의 pane 과 코드 주석의 숫자다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, axes, line, hbar, snippet } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const hsh = (i) => { const s = Math.sin((i + 1) * 91.17) * 43758.5453; return s - Math.floor(s); };
  const BIN = [INFO, ACC, GOOD, WARN];                       // 나선 색: 안쪽(파랑) → 바깥쪽(주황)
  const binCol = (f) => BIN[Math.min(3, Math.floor(f * 4))];
  const SP = () => (typeof SPIRAL_POINTS !== 'undefined' ? SPIRAL_POINTS : []);
  const EL = () => (typeof ELLIPSE_POINTS !== 'undefined' ? ELLIPSE_POINTS : []);
  const right = (y, s, o) => tx(520, y, s, Object.assign({ 'font-size': 15 }, o || {}));
  const head = (y, s, op, col) => tx(520, y, s, { 'font-size': 17, 'font-weight': 800, fill: col || INK, opacity: op });
  function xm(x, y, r, col, op) { el('path', { d: `M${x - r},${y - r} L${x + r},${y + r} M${x + r},${y - r} L${x - r},${y + r}`, stroke: col || BAD, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: op ?? 1 }); }
  function dotAt(x, y, r, col, op, o) { o = o || {}; el('circle', { cx: x, cy: y, r, fill: o.hollow ? PANEL : col, stroke: col, 'stroke-width': 2, opacity: op ?? 1 }); }

  // ---------- 1. 차원의 저주 ----------
  const CLOUD = Array.from({ length: 40 }, (_, i) => [70 + hsh(i) * 360, 64 + hsh(i + 77) * 230]);
  function ratioBars(c) { const rows = (c.beat.pane && c.beat.pane.rows) || [], prev = (c.prev && c.prev.pane && c.prev.pane.rows) || [];
    tx(520, 40, '최근접 / 최원접 거리 비율', { 'font-size': 15, 'font-weight': 800, fill: MUT });
    rows.forEach((r, i) => { const y = 66 + i * 84, p = prev[i], v = tween(p ? p.ratio : 0, r.ratio, c.u), col = v < 0.3 ? GOOD : v < 0.7 ? WARN : BAD;
      mono(520, y + 16, `${r.dim.toLocaleString('en-US')}차원`, { 'font-size': 16, 'font-weight': 800 });
      el('rect', { x: 640, y: y, width: 240, height: 22, rx: 4, fill: SOFT });
      if (v > 0) el('rect', { x: 640, y: y, width: Math.max(2, 240 * v), height: 22, rx: 4, fill: col, opacity: 0.85 });
      el('line', { x1: 880, y1: y - 5, x2: 880, y2: y + 27, stroke: BAD, 'stroke-width': 2 });
      mono(930, y + 16, r.ratio ? v.toFixed(2) : '–', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'end', fill: r.ratio ? col : MUT });
      tx(520, y + 46, r.note.replace(/\s*🔥/, ''), { 'font-size': 14, fill: MUT }); });
    mono(880, 56, '1.0', { 'font-size': 13.5, fill: BAD, 'text-anchor': 'middle', 'font-weight': 700 }); }
  function s1(t, c) { const { k, u } = c; ratioBars(c);
    if (k === 0) { const ref = 7; zone(40, 40, 430, 280, '무작위 점 (일부)', { fill: SOFT });
      CLOUD.forEach(([x, y], i) => dotAt(x, y + 10, 5, i === ref ? INK : OFF, pop(u, 0.1 + i * 0.01)));
      const [rx, ry] = CLOUD[ref], ds = CLOUD.map(([x, y], i) => (i === ref ? null : Math.hypot(x - rx, y - ry))), valid = ds.filter((d) => d != null);
      const ni = ds.indexOf(Math.min(...valid)), fi = ds.indexOf(Math.max(...valid));
      grow(rx, ry + 10, CLOUD[ni][0], CLOUD[ni][1] + 10, E(u, 0.6, 1.0), GOOD, { plain: true, sw: 3 });
      grow(rx, ry + 10, CLOUD[fi][0], CLOUD[fi][1] + 10, E(u, 1.1, 1.7), BAD, { plain: true, sw: 3 });
      lbl(CLOUD[ni][0], CLOUD[ni][1] - 6, '최근접', fade(u, 1.0), { fill: GOOD });
      lbl(CLOUD[fi][0], CLOUD[fi][1] + 36, '최원접', fade(u, 1.6), { fill: BAD });
      card(255, 370, 360, 48, { rx: 10, text: 'ratio = 최근접 / 최원접', fs: 17, mono: true, stroke: ACC, color: ACC, s: pop(u, 2.0) }); }
    if (k === 1 || k === 2) { const N = 9, cs = 30, gx = 110, gy = 92;
      pill(255, 50, k === 1 ? 'X  (500 × n_dim)' : 'np.fill_diagonal(d, inf)', ACC, k === 1 ? pop(u, 0.2) : 1, { mono: true, fs: 15 });
      const D = (i, j) => Math.hypot(CLOUD[i][0] - CLOUD[j][0], CLOUD[i][1] - CLOUD[j][1]);
      const fill = k === 1 ? lerp(0, N * N, E(u, 0.5, 2.2)) : N * N;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const idx = i * N + j; if (idx >= fill) continue; const diag = i === j;
        el('rect', { x: gx + j * cs, y: gy + i * cs, width: cs - 3, height: cs - 3, rx: 3, fill: diag && k === 2 ? SOFT : ACC, opacity: diag && k === 2 ? 1 : 0.15 + 0.6 * D(i, j) / 400 });
        if (diag && k === 2) mono(gx + j * cs + 13, gy + i * cs + 19, '∞', { 'font-size': 15, 'font-weight': 800, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.3) }); }
      tx(gx, gy + N * cs + 26, k === 1 ? '500 × 500 거리 행렬 (앞 9칸만)' : '자기 자신은 ∞ 로 막는다', { 'font-size': 15, fill: MUT, 'font-weight': 600 });
      if (k === 2) for (let i = 0; i < N; i++) { const a = 0.6 + i * 0.16, row = Array.from({ length: N }, (_, j) => (j === i ? null : D(i, j))), vs = row.filter((v) => v != null);
        const mn = row.indexOf(Math.min(...vs)), mx = row.indexOf(Math.max(...vs)), op = fade(u, a, 0.2);
        el('rect', { x: gx + mn * cs - 1, y: gy + i * cs - 1, width: cs - 1, height: cs - 1, rx: 4, fill: 'none', stroke: GOOD, 'stroke-width': 3, opacity: op });
        el('rect', { x: gx + mx * cs - 1, y: gy + i * cs - 1, width: cs - 1, height: cs - 1, rx: 4, fill: 'none', stroke: BAD, 'stroke-width': 3, opacity: op }); }
      if (k === 2) { tx(410, 140, '행마다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.5) }); tx(410, 170, '■ 최근접', { 'font-size': 15, 'font-weight': 800, fill: GOOD, opacity: fade(u, 0.7) }); tx(410, 198, '■ 최원접', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.7) }); } }
    if (k >= 3 && k <= 5) { // 자: 최원접 길이를 고정하고 최근접 길이를 비율만큼
      const rows = c.beat.pane.rows, prow = (c.prev && c.prev.pane.rows) || rows;
      let v, dim; if (k === 3) { v = tween(0, rows[0].ratio, u); dim = 2; } else if (k === 4) { v = tween(prow[0].ratio, rows[1].ratio, u); dim = 10; }
      else { const a = E(u, 0.2, 1.0), b = E(u, 1.4, 2.2); v = b > 0 ? lerp(rows[2].ratio, rows[3].ratio, b) : lerp(prow[1].ratio, rows[2].ratio, a); dim = u < 1.3 ? 100 : 1000; }
      const L = 380, x0 = 50;
      mono(x0, 70, `${dim}차원`, { 'font-size': 26, 'font-weight': 800 });
      tx(x0, 128, '최원접', { 'font-size': 16, 'font-weight': 800, fill: BAD }); el('rect', { x: x0, y: 140, width: L, height: 30, rx: 5, fill: BAD, opacity: 0.8 });
      tx(x0, 214, '최근접', { 'font-size': 16, 'font-weight': 800, fill: GOOD }); el('rect', { x: x0, y: 226, width: Math.max(3, L * v), height: 30, rx: 5, fill: GOOD, opacity: 0.85 });
      el('line', { x1: x0 + L, y1: 130, x2: x0 + L, y2: 266, stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
      tx(x0, 310, `최근접 = 최원접 × ${v.toFixed(2)}`, { 'font-size': 17, 'font-weight': 800, class: 'mono' });
      const msg = k === 3 ? '가까운 이웃이 확실히 가깝다' : k === 4 ? '구분이 흐려지기 시작한다' : '"가깝다" 와 "멀다" 가 거의 같아진다';
      tx(x0, 350, msg, { 'font-size': 16, 'font-weight': 700, fill: k === 3 ? GOOD : k === 4 ? WARN : BAD, opacity: fade(u, 1.8) }); }
    if (k === 6) { tx(50, 64, '거리에 기대는 알고리즘이 흔들린다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.1) });
      ['kNN', 'KMeans', '거리 기반 이상탐지'].forEach((s, i) => { const x = [95, 210, 365][i]; pill(x, 110, s, BAD, pop(u, 0.3 + i * 0.2), { fs: 15 }); const hw = (tw(s, 15) + 10) / 2, g = E(u, 0.9 + i * 0.2, 1.2 + i * 0.2); if (g > 0) el('line', { x1: x - hw, y1: 110, x2: x - hw + 2 * hw * g, y2: 110, stroke: BAD, 'stroke-width': 2.5 }); });
      tx(50, 186, '데이터로 메우기: 한 변 10칸이면', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.1) });
      [['1차원', '10칸'], ['2차원', '100칸'], ['d 차원', '10^d 칸']].forEach(([a, b], i) => { const x = 60 + i * 140; mono(x, 220, a, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.2 + i * 0.2) }); mono(x, 244, b, { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.2 + i * 0.2) }); });
      card(250, 330, 380, 56, { rx: 12, text: '해법: 정보를 지키며 차원을 줄인다', fs: 17, stroke: ACC, color: ACC, fill: ACCBG, s: pop(u, 2.0) }); } }

  // ---------- 2. PCA ----------
  const PC = { cx: 255, cy: 220, s: 2.7 };
  function pcaInfo() { const P = EL(), n = P.length || 1, mx = P.reduce((a, p) => a + p.x, 0) / n, my = P.reduce((a, p) => a + p.y, 0) / n;
    let sxx = 0, syy = 0, sxy = 0; P.forEach((p) => { sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; sxy += (p.x - mx) * (p.y - my); });
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy); return { mx, my, e1: [Math.cos(th), Math.sin(th)], e2: [-Math.sin(th), Math.cos(th)] }; }
  const sxp = (x) => PC.cx + x * PC.s, syp = (y) => PC.cy - y * PC.s;
  function axisLine(info, e, len, u, col, dash, w) { if (u <= 0) return; const L = len * u;
    el('line', { x1: sxp(info.mx - e[0] * L), y1: syp(info.my - e[1] * L), x2: sxp(info.mx + e[0] * L), y2: syp(info.my + e[1] * L), stroke: col, 'stroke-width': w || 3.5, 'stroke-dasharray': dash, 'stroke-linecap': 'round' }); }
  function s2(t, c) { const { k, u } = c, P = EL(), info = pcaInfo(), sc = (c.beat.pane && c.beat.pane.scree) || [], psc = (c.prev && c.prev.pane && c.prev.pane.scree) || [];
    el('rect', { x: 30, y: 30, width: 450, height: 360, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(46, 54, '그림 = 2차원 축소판 (점 26개)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    if (k >= 2) axisLine(info, info.e1, 62, k === 2 ? E(u, 0.3, 1.2) : 1, INK, null, 3.5);
    if (k >= 3) axisLine(info, info.e2, 24, k === 3 ? E(u, 0.3, 1.0) : 1, WARN, '7 5', 3);
    const proj = k === 5 ? E(u, 0.3, 1.5) : 0;
    P.forEach((p, i) => { const t1 = (p.x - info.mx) * info.e1[0] + (p.y - info.my) * info.e1[1], qx = info.mx + info.e1[0] * t1, qy = info.my + info.e1[1] * t1;
      if (k === 5) el('line', { x1: sxp(p.x), y1: syp(p.y), x2: sxp(qx), y2: syp(qy), stroke: OFF, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: fade(u, 0.2) });
      dotAt(sxp(lerp(p.x, qx, proj)), syp(lerp(p.y, qy, proj)), 5.5, k === 5 && proj > 0.95 ? INK : ACC, (k === 0 ? pop(u, 0.2 + i * 0.05) : 1) * 0.85); });
    if (k >= 2) { const v = tween(psc[0] ? psc[0].ratio : 0, sc[0].ratio, u), e = info.e1;
      lbl(sxp(info.mx + e[0] * 66), syp(info.my + e[1] * 66) - 14, `PC1 · ${Math.round(v * 100)}%`, k === 2 ? fade(u, 1.0) : 1, { fill: INK, 'font-size': 16 }); }
    if (k >= 3) { const v = tween(psc[1] ? psc[1].ratio : 0, sc[1].ratio, u), e = info.e2;
      lbl(sxp(info.mx + e[0] * 30) - 4, syp(info.my + e[1] * 30) - 10, `PC2 · ${Math.round(v * 100)}%`, k === 3 ? fade(u, 0.9) : 1, { fill: WARN, 'font-size': 16 }); }
    // 오른쪽
    if (k === 0) { head(54, 'X = load_customer_features()', fade(u, 0.1));
      const cols = ['구매액', '방문수', '체류시간', '…'];
      cols.forEach((s, j) => { card(560 + j * 95, 96, 88, 32, { rx: 4, text: s, fs: 14, fill: SOFT, stroke: GRID, sw: 1.2, op: fade(u, 0.3 + j * 0.1) }); });
      for (let i = 0; i < 6; i++) cols.forEach((_, j) => el('rect', { x: 516 + j * 95, y: 118 + i * 30, width: 88, height: 26, rx: 3, fill: PANEL, stroke: GRID, opacity: fade(u, 0.6 + i * 0.12) }));
      mono(520, 340, '(5000, 100)', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      right(372, '고객 5000명 × 피처 100개', { fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 1) { head(54, 'StandardScaler', fade(u, 0.1)); const g = E(u, 0.8, 1.8);
      [['구매액 (원)', 380, WARN], ['방문수 (회)', 40, INFO], ['체류시간 (초)', 170, GOOD]].forEach(([nm, w0, col], i) => { const y = 96 + i * 66, w = lerp(w0, 170, g), x = lerp(520, 640 - 85, g);
        right(y, nm, { 'font-weight': 700, fill: col }); el('rect', { x, y: y + 10, width: w, height: 18, rx: 4, fill: col, opacity: 0.8 }); });
      right(316, '평균 0 · 분산 1 로 맞춘다', { 'font-weight': 800, opacity: fade(u, 1.9) });
      right(346, '단위가 큰 피처가 PC1 을 독점하지 않게', { fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 2) { card(705, 80, 340, 50, { rx: 10, text: 'PCA(n_components=10)', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      mono(560, 170, '(5000, 100)', { 'font-size': 20, 'font-weight': 800, fill: MUT, opacity: fade(u, 0.6) }); grow(700, 164, 760, 164, E(u, 1.0, 1.4), ACC);
      mono(775, 170, '(5000, 10)', { 'font-size': 20, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.4) });
      right(240, 'PC1 = 데이터가 가장 넓게 퍼진 방향', { 'font-weight': 700, opacity: fade(u, 1.6) });
      right(270, '타원의 긴 축과 겹친다', { fill: MUT, opacity: fade(u, 1.9) }); }
    if (k === 3) { head(54, '그림의 타원: explained_variance_ratio_', fade(u, 0.1));
      sc.forEach((s, i) => { const v = tween(psc[i] ? psc[i].ratio : 0, s.ratio, u); right(96 + i * 44, s.pc, { 'font-weight': 800, class: 'mono' }); hbar(580, 82 + i * 44, 280, v, 1, { h: 20, col: i ? WARN : INK, text: Math.round(v * 100) + '%' }); });
      right(220, '코드의 100차원 데이터는', { fill: MUT, opacity: fade(u, 1.4) });
      mono(520, 252, 'evr[:4] = [0.41, 0.22, 0.11, 0.07]', { 'font-size': 15.5, 'font-weight': 700, opacity: fade(u, 1.6) });
      right(300, 'PC2 는 PC1 에 수직, 남은 분산이 최대', { 'font-weight': 700, opacity: fade(u, 2.0) }); }
    if (k === 4) { const evr = [0.41, 0.22, 0.11, 0.07], cum = [0.41, 0.63, 0.74, 0.81];
      const ax = axes(570, 70, 330, 250, { x: [0.4, 4.6], y: [0, 1], yt: [0, 0.5, 0.9], xt: [1, 2, 3, 4], yl: '코드의 evr (100차원)', xl: '주성분' });
      evr.forEach((v, i) => { const h = (ax.Y(0) - ax.Y(v)) * E(u, 0.2 + i * 0.15, 0.6 + i * 0.15); el('rect', { x: ax.X(i + 1) - 22, y: ax.Y(0) - h, width: 44, height: h, fill: ACC, opacity: 0.75 }); if (h > 1) mono(ax.X(i + 1), ax.Y(0) - h - 6, v.toFixed(2), { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.15) }); });
      line(ax, cum.map((v, i) => [i + 1, v]), E(u, 1.1, 1.8), BAD);
      cum.forEach((v, i) => { if (u > 1.1 + i * 0.18) el('circle', { cx: ax.X(i + 1), cy: ax.Y(v), r: 4.5, fill: BAD }); });
      if (u > 1.8) mono(ax.X(4) + 10, ax.Y(0.81) + 5, '0.81', { 'font-size': 14, 'font-weight': 800, fill: BAD });
      el('line', { x1: ax.X(0.4), y1: ax.Y(0.9), x2: ax.X(4.6), y2: ax.Y(0.9), stroke: INK, 'stroke-width': 1.8, 'stroke-dasharray': '6 4', opacity: fade(u, 1.9) });
      tx(520, 400, '4축까지 누적 0.81 → 90% 선까지 축을 더 남긴다', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 2.2) }); }
    if (k === 5) { head(54, '사영 — 2D 가 1D 로', fade(u, 0.1));
      right(100, '각 점을 PC1 위로 수직으로 내린다', { opacity: fade(u, 0.4) });
      const keep = sc[0].ratio; el('rect', { x: 520, y: 150, width: 380 * keep, height: 34, rx: 4, fill: ACC, opacity: 0.85 * fade(u, 1.5) }); el('rect', { x: 520 + 380 * keep + 2, y: 150, width: 380 * (1 - keep) - 2, height: 34, rx: 4, fill: OFF, opacity: fade(u, 1.5) });
      mono(530, 173, `남는 퍼짐 ${Math.round(keep * 100)}%`, { 'font-size': 15, 'font-weight': 800, fill: PANEL, opacity: fade(u, 1.7) });
      right(220, `버리는 것: PC2 성분 ${Math.round((1 - keep) * 100)}%`, { fill: MUT, 'font-weight': 700, opacity: fade(u, 1.9) });
      right(260, '차원은 절반, 정보는 대부분 남는다', { 'font-weight': 800, opacity: fade(u, 2.2) }); } }

  // ---------- 3. 스위스롤에서 PCA 실패 ----------
  const S = { cx: 240, cy: 190, s: 2.55 };
  const spx = (p) => S.cx + p.x * S.s, spy = (p) => S.cy - p.y * S.s;
  const stripY = 378;
  function pair() { const P = SP(); let best = null; P.forEach((a, i) => P.forEach((b, j) => { if (j <= i || Math.abs(a.frac - b.frac) < 0.4) return; const d = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) * 0.4; if (!best || d < best[2]) best = [i, j, d]; })); return best; }
  function s3(t, c) { const { k, u } = c, P = SP();
    el('rect', { x: 30, y: 24, width: 420, height: 316, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    tx(44, 48, '스위스롤 (말린 종이)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
    const down = k === 2 ? E(u, 0.6, 1.8) : k > 2 ? 1 : 0;
    if (k === 4) for (let i = 0; i < P.length - 1; i++) { const g = E(u, 0.3 + i * 0.04, 0.5 + i * 0.04); if (g > 0) el('line', { x1: spx(P[i]), y1: spy(P[i]), x2: lerp(spx(P[i]), spx(P[i + 1]), g), y2: lerp(spy(P[i]), spy(P[i + 1]), g), stroke: binCol(P[i].frac), 'stroke-width': 3 }); }
    if (k === 3) { const [i, j] = pair(), a = P[i], b = P[j], g = E(u, 0.4, 1.6), m = Math.round(lerp(i, j, g));
      const path = P.slice(i, m + 1).map((p) => `${spx(p)},${spy(p)}`).join(' '); if (g > 0) el('polyline', { points: path, fill: 'none', stroke: WARN, 'stroke-width': 7, opacity: 0.5, 'stroke-linejoin': 'round' });
      grow(spx(a), spy(a), spx(b), spy(b), E(u, 1.7, 2.1), INK, { plain: true, sw: 3, dash: '6 4' }); }
    P.forEach((p, i) => { const s = k === 0 ? pop(u, 0.2 + i * 0.05, 0.4) : 1, op = k >= 3 ? 0.55 : 1;
      dotAt(spx(p), spy(p), 6 * s, binCol(p.frac), op);
      if (down > 0) { const x = spx(p), y = lerp(spy(p), stripY + (hsh(i) - 0.5) * 18, down); dotAt(x, y, 5.5, binCol(p.frac), k === 2 ? 1 : 0.9); } });
    if (k === 1) { const x = lerp(60, 420, E(u, 0.8, 2.2)); el('line', { x1: x, y1: 40, x2: x, y2: 330, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.7) }); }
    if (down > 0) { el('line', { x1: 60, y1: stripY + 16, x2: 420, y2: stripY + 16, stroke: MUT, 'stroke-width': 1.5 }); tx(430, stripY + 6, 'PCA 축', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); }
    if (k === 3) { const [i, j] = pair(); tx(spx(P[i]) - 14, spy(P[i]) + 5, '안쪽', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: binCol(P[i].frac), stroke: PANEL, 'stroke-width': 5, 'paint-order': 'stroke', opacity: fade(u, 0.3) }); tx(spx(P[j]) - 14, spy(P[j]) + 5, '바깥쪽', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'end', fill: binCol(P[j].frac), stroke: PANEL, 'stroke-width': 5, 'paint-order': 'stroke', opacity: fade(u, 0.3) }); }
    // 오른쪽
    if (k === 0) { head(54, '평면을 돌돌 만 데이터', fade(u, 0.1));
      for (let i = 0; i < 24; i++) el('rect', { x: 520 + i * 16, y: 90, width: 15, height: 40, fill: binCol(i / 24), opacity: fade(u, 0.4 + i * 0.03) });
      right(160, 'color = 종이 위에서의 위치', { 'font-weight': 800, opacity: fade(u, 1.3) });
      right(190, '= 진짜 이웃 순서', { fill: MUT, opacity: fade(u, 1.5) });
      mono(520, 250, 'X (1500, 3)  ·  color', { 'font-size': 16, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.9) });
      right(290, '그림은 그 단면 (점 34개)', { fill: MUT, opacity: fade(u, 2.1) }); }
    if (k === 1) { card(700, 80, 330, 50, { rx: 10, text: 'PCA(n_components=2)', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.2) });
      right(160, 'Step 2 와 똑같은 코드', { 'font-weight': 700, opacity: fade(u, 0.6) });
      right(190, '분산이 큰 직선 방향으로 눌러 찍는다', { fill: MUT, opacity: fade(u, 1.0) });
      right(250, '달라진 것은 데이터의 모양뿐', { 'font-weight': 800, opacity: fade(u, 2.0) }); }
    if (k === 2) { head(54, 'c=color 로 찍어 본다', fade(u, 0.1));
      right(110, '아래 띠 = PCA 축 위의 위치', { opacity: fade(u, 1.0) });
      right(150, '파랑과 주황이 같은 자리에 섞인다', { 'font-weight': 800, fill: BAD, opacity: fade(u, 1.9) }); }
    if (k === 3) { head(54, '층이 겹친 이유', fade(u, 0.1));
      el('line', { x1: 522, y1: 110, x2: 572, y2: 110, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '6 4', opacity: fade(u, 1.8) }); tx(584, 116, '유클리드 거리: 가깝다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.8) });
      el('line', { x1: 522, y1: 150, x2: 572, y2: 150, stroke: WARN, 'stroke-width': 7, opacity: 0.5 * fade(u, 0.5) }); tx(584, 156, '종이 위 거리: 한 바퀴 멀다', { 'font-size': 15, 'font-weight': 700, fill: WARN, opacity: fade(u, 0.6) });
      right(220, '직선 자로 누르면 두 층이 포개진다', { 'font-weight': 800, fill: BAD, opacity: fade(u, 2.2) }); }
    if (k === 4) { [['PCA 의 질문', '어느 직선 방향이 분산이 큰가?', MUT, 0.3], ['필요한 질문', '누가 누구의 이웃인가?', ACC, 1.2]].forEach(([a, b, col, at], i) => { const y = 90 + i * 110;
        card(710, y, 380, 84, { rx: 12, stroke: col, fill: i ? ACCBG : SOFT, s: pop(u, at) });
        tx(536, y - 10, a, { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, at + 0.1) }); tx(536, y + 20, b, { 'font-size': 17, 'font-weight': 800, fill: i ? ACC : INK, opacity: fade(u, at + 0.1) }); });
      xm(880, 90, 12, BAD, fade(u, 0.9)); right(300, '선 = 종이 위의 이웃 관계', { fill: MUT, opacity: fade(u, 2.0) }); }
    if (k === 5) { head(54, '실무 오판 패턴', fade(u, 0.1)); const bx = 610, by = 170;
      for (let i = 0; i < 40; i++) dotAt(bx + (hsh(i + 300) - 0.5) * 150, by + (hsh(i + 400) - 0.5) * 110, 4.5, BIN[i % 4], fade(u, 0.3 + i * 0.01));
      tx(bx, 248, '임베딩 → PCA 2D', { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      card(820, 120, 170, 40, { rx: 20, text: '"구조가 없네"', fs: 15, stroke: BAD, color: BAD, s: pop(u, 1.0) }); xm(820, 120, 14, BAD, fade(u, 1.6));
      right(300, '구조가 없는 게 아니라', { opacity: fade(u, 1.8) }); right(328, '휘어진 구조를 직선 도구로 못 편 것', { 'font-weight': 800, opacity: fade(u, 2.0) }); }
    if (k === 6) { head(54, '이웃 관계를 지키는 도구로', fade(u, 0.1)); const y = 150;
      el('line', { x1: 540, y1: y, x2: 900, y2: y, stroke: GRID, 'stroke-width': 3 });
      P.forEach((p, i) => dotAt(lerp(540, 900, p.frac), y + (hsh(i + 50) - 0.5) * 12, 5.5, binCol(p.frac), fade(u, 0.5 + p.frac * 1.2)));
      right(220, '색 순서대로 펴진다', { 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.8) });
      pill(620, 280, 't-SNE', ACC, pop(u, 2.0), { fs: 16 }); pill(730, 280, 'UMAP', ACC, pop(u, 2.2), { fs: 16 }); } }

  // ---------- 4. t-SNE / UMAP ----------
  const lineX = (f) => lerp(540, 910, f), lineY = (i) => 230 + (hsh(i + 60) - 0.5) * 22;
  const sp2 = (p) => [200 + p.x * 2.1, 210 - p.y * 2.1];
  function bonds(pos, P, op) { for (let i = 0; i < P.length - 1; i++) el('line', { x1: pos[i][0], y1: pos[i][1], x2: pos[i + 1][0], y2: pos[i + 1][1], stroke: binCol(P[i].frac), 'stroke-width': 2, opacity: op }); }
  function s4(t, c) { const { k, u } = c, P = SP();
    if (k === 0) { const g = E(u, 0.8, 2.2);
      P.forEach((p, i) => dotAt(...sp2(p), 4.5, binCol(p.frac), 0.25));
      const pos = P.map((p, i) => { const [x0, y0] = sp2(p); return [lerp(x0, lineX(p.frac), g), lerp(y0, lineY(i), g)]; });
      bonds(pos, P, fade(u, 0.3) * 0.7); pos.forEach((q, i) => dotAt(q[0], q[1], 5.5, binCol(P[i].frac), 1));
      lbl(200, 60, 'P — 고차원 이웃 확률', fade(u, 0.2), { 'font-size': 16 }); lbl(725, 120, 'Q — 저차원 이웃 확률', fade(u, 1.5), { 'font-size': 16 });
      banner(480, 370, '축을 찾지 않는다 · P ≈ Q 가 되도록 점을 배치한다', pop(u, 2.2)); return; }
    if (k === 1) { const g = E(u, 0.3, 2.3), it = Math.round(g * 1000);
      card(260, 50, 420, 44, { rx: 10, text: 'TSNE(perplexity=30, random_state=42)', fs: 15, mono: true, stroke: ACC, color: ACC, s: pop(u, 0.1) });
      const pos = P.map((p, i) => [lerp(60 + hsh(i + 7) * 400, lerp(70, 450, p.frac), g), lerp(110 + hsh(i + 9) * 230, 230 + (hsh(i + 60) - 0.5) * 22, g)]);
      bonds(pos, P, 0.5 * g); pos.forEach((q, i) => dotAt(q[0], q[1], 5.5, binCol(P[i].frac), 1));
      tx(60, 380, '반복 최적화', { 'font-size': 15, 'font-weight': 700 }); el('rect', { x: 170, y: 366, width: 280, height: 16, rx: 4, fill: SOFT }); el('rect', { x: 170, y: 366, width: 280 * g, height: 16, rx: 4, fill: ACC });
      tx(460, 380, '수 분', { 'font-size': 15, fill: MUT });
      const cx = 700, cy = 200; for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 14 + hsh(i + 200) * 90; dotAt(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, 4.5, r < 60 ? ACC : OFF, fade(u, 0.5)); }
      dotAt(cx, cy, 7, INK, 1); el('circle', { cx, cy, r: 62 * E(u, 0.8, 1.4), fill: 'none', stroke: ACC, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
      lbl(cx, 330, 'perplexity ≈ 이웃 몇 명', fade(u, 1.4), { fill: ACC }); sub(cx, 356, '5~50 을 여러 번 돌려 본다', fade(u, 1.8), { 'font-size': 15 }); return; }
    if (k === 2) { const st = [['X', '(n, 수백 차원)', INK], ['PCA', '→ 50차원', ACC], ['t-SNE', '→ 2차원', INFO]];
      st.forEach(([a, b, col], i) => { const x = 150 + i * 330, s = pop(u, 0.2 + i * 0.5); card(x, 160, 230, 92, { rx: 12, stroke: col, s });
        tx(x, 150, a, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.5) }); mono(x, 182, b, { 'font-size': 15, 'text-anchor': 'middle', opacity: fade(u, 0.3 + i * 0.5) });
        if (i < 2) grow(x + 120, 160, x + 205, 160, E(u, 0.5 + i * 0.5, 0.8 + i * 0.5), ACC); });
      dot([[270, 160], [480, 160], [600, 160], [810, 160]], seg(u, 1.4, 2.4), ACC, 7);
      tx(480, 290, '빠르고 결정적인 PCA 가 앞단 압축 · 이웃 펴기는 t-SNE', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.8) });
      sub(480, 322, '노이즈가 줄고 계산이 빨라진다 (scikit-learn 문서 권장)', fade(u, 2.1), { 'font-size': 15 }); return; }
    if (k === 3) { // 해석 금지
      el('rect', { x: 30, y: 24, width: 450, height: 370, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); tx(44, 48, 't-SNE 결과 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      const cl = [[130, 130, 26, 30, INFO], [360, 150, 60, 30, ACC], [220, 310, 38, 30, WARN]];
      cl.forEach(([x, y, sp, n, col], j) => { for (let i = 0; i < n; i++) { const a = hsh(i + j * 50) * 6.283, r = Math.sqrt(hsh(i + j * 50 + 9)) * sp; dotAt(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 4.5, col, 0.85); } });
      grow(160, 135, 300, 150, E(u, 0.3, 0.8), MUT, { plain: true, dash: '5 4' }); grow(140, 160, 205, 280, E(u, 0.3, 0.8), MUT, { plain: true, dash: '5 4' }); xm(232, 142, 10, BAD, fade(u, 0.8)); xm(172, 222, 10, BAD, fade(u, 0.8));
      el('circle', { cx: 360, cy: 150, r: 70, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '4 4', opacity: fade(u, 1.0) });
      const rules = ['군집 사이의 거리 → 의미 없음', '군집의 크기 · 밀도 → 의미 없음', 'perplexity 바꾸면 배치가 통째로', '새 데이터 transform() 불가'];
      rules.forEach((s, i) => { const y = 90 + i * 70, at = 0.3 + i * 0.5; xm(530, y - 5, 9, BAD, fade(u, at)); tx(552, y, s, { 'font-size': 16, 'font-weight': 700, opacity: fade(u, at) }); });
      tx(520, 380, '믿을 것은 국소 이웃 구조뿐', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.3) }); return; }
    if (k === 4) { // UMAP: k-이웃 그래프 → 배치
      P.forEach((p, i) => dotAt(...sp2(p), 5, binCol(p.frac), 0.9));
      P.forEach((p, i) => { const d = P.map((q, j) => [Math.hypot(p.x - q.x, p.y - q.y), j]).filter(([, j]) => j !== i).sort((a, b) => a[0] - b[0]).slice(0, 2);
        d.forEach(([, j], m) => { const [x1, y1] = sp2(p), [x2, y2] = sp2(P[j]); grow(x1, y1, x2, y2, E(u, 0.3 + i * 0.02, 0.6 + i * 0.02), MUT, { plain: true, sw: 1.6 }); }); });
      lbl(200, 60, 'k-이웃 그래프', fade(u, 0.3), { 'font-size': 16 });
      grow(400, 210, 520, 210, E(u, 1.2, 1.5), ACC);
      const g = E(u, 1.5, 2.2); bonds(P.map((p, i) => [lineX(p.frac), lineY(i)]), P, 0.6 * g); P.forEach((p, i) => dotAt(lineX(p.frac), lineY(i), 5.5, binCol(p.frac), g));
      lbl(725, 150, '그래프를 2D 에 배치', fade(u, 1.6), { 'font-size': 16 });
      tx(540, 330, 't-SNE 보다 수십 배 빠르다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.1) }); tx(540, 358, '군집 간 상대 배치도 더 잘 남긴다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.3) }); return; }
    if (k === 5) { // 파라미터 두 개
      const panel = (x, y, kind, j) => { el('rect', { x, y, width: 200, height: 130, rx: 10, fill: SOFT, opacity: fade(u, 0.3 + j * 0.25) });
        const pts = []; for (let i = 0; i < 36; i++) { let px, py;
          if (kind === 'small') { const c0 = i % 6; px = x + 30 + (c0 % 3) * 70 + (hsh(i) - 0.5) * 18; py = y + 40 + Math.floor(c0 / 3) * 55 + (hsh(i + 9) - 0.5) * 18; }
          else if (kind === 'big') { const c0 = i % 2; px = x + 60 + c0 * 80 + (hsh(i) - 0.5) * 60; py = y + 65 + (hsh(i + 9) - 0.5) * 70; }
          else if (kind === 'tight') { const c0 = i % 2; px = x + 60 + c0 * 80 + (hsh(i) - 0.5) * 22; py = y + 65 + (hsh(i + 9) - 0.5) * 24; }
          else { const c0 = i % 2; px = x + 55 + c0 * 90 + (hsh(i) - 0.5) * 70; py = y + 65 + (hsh(i + 9) - 0.5) * 90; }
          dotAt(px, py, 4, [INFO, ACC][i % 2], fade(u, 0.4 + j * 0.25)); } };
      [['n_neighbors=15', '전역 ↔ 국소 균형', ['small', '작게: 미세 구조'], ['big', '크게: 큰 그림']], ['min_dist=0.1', '점이 얼마나 뭉칠지', ['tight', '작게: 빽빽'], ['loose', '크게: 고르게']]].forEach(([nm, s, A, B], r) => { const y = 34 + r * 190;
        pill(130, y + 20, nm, ACC, pop(u, 0.2 + r * 0.6), { mono: true, fs: 15 }); tx(40, y + 64, s, { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4 + r * 0.6) });
        [A, B].forEach(([kind, cap], j) => { const x = 300 + j * 320; panel(x, y, kind, r * 2 + j); tx(x + 210, y + 70, cap, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6 + (r * 2 + j) * 0.25) }); }); });
      return; }
    if (k === 6) { // 실무 기본값
      el('rect', { x: 30, y: 24, width: 440, height: 370, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 }); tx(44, 48, '이미 만든 UMAP 지도', { 'font-size': 14, fill: MUT, 'font-weight': 600 });
      [[140, 150, INFO], [330, 140, ACC], [240, 300, WARN]].forEach(([x, y, col], j) => { for (let i = 0; i < 24; i++) { const a = hsh(i + j * 40) * 6.283, r = Math.sqrt(hsh(i + j * 40 + 5)) * 44; dotAt(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 4.5, col, 0.8); } });
      const q = E(u, 1.2, 2.0), sx = lerp(420, 330, q), sy = lerp(-10, 140, q); if (u > 1.1) { el('circle', { cx: sx, cy: sy, r: 9, fill: INK, stroke: PANEL, 'stroke-width': 2 }); if (u > 2.0) el('circle', { cx: 330, cy: 140, r: 16, fill: 'none', stroke: INK, 'stroke-width': 2 }); }
      mono(250, 382, 'reducer.transform(X_new)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      [['속도', '수만~수십만 점도 수십 초'], ['전역 구조', '군집 간 상대 배치가 비교적 남는다'], ['transform()', '새 데이터를 기존 지도에 (t-SNE 불가)']].forEach(([a, b], i) => { const y = 90 + i * 84, at = 0.3 + i * 0.5;
        R.check(520, y - 6, 10, pop(u, at)); tx(545, y, a, { 'font-size': 17, 'font-weight': 800, opacity: fade(u, at) }); tx(545, y + 26, b, { 'font-size': 15, fill: MUT, opacity: fade(u, at + 0.1) }); });
      pill(700, 370, '기본값  t-SNE → UMAP', ACC, pop(u, 2.2), { fs: 15 }); } }

  // ---------- 5. 실무 선택 ----------
  function table(c) { const rows = (c.beat.pane && c.beat.pane.rows) || [], prevN = (c.prev && c.prev.pane && c.prev.pane.rows ? c.prev.pane.rows.length : 0), u = c.u;
    const top = 236, rh = 27, XC = 40, XP = 450, XT = 690;
    tx(XC, top, '상황', { 'font-size': 14, 'font-weight': 800, fill: MUT }); tx(XP, top, 'PCA', { 'font-size': 14, 'font-weight': 800, fill: ACC }); tx(XT, top, 't-SNE / UMAP', { 'font-size': 14, 'font-weight': 800, fill: INFO });
    el('line', { x1: XC, y1: top + 8, x2: 930, y2: top + 8, stroke: INK, 'stroke-width': 1.8 });
    const mc = (v) => (v.startsWith('◎') ? GOOD : v.startsWith('✗') ? BAD : MUT);
    rows.forEach((r, i) => { const y = top + 30 + i * rh, fresh = i >= prevN && c.k > 0, op = fresh ? fade(u, 0.4 + (i - prevN) * 0.3) : 1;
      if (fresh) el('rect', { x: XC - 8, y: y - 20, width: 898, height: rh - 2, rx: 4, fill: 'var(--hl)', opacity: 0.45 * op });
      tx(XC, y, r.crit, { 'font-size': 14.5, opacity: op }); tx(XP, y, r.pca, { 'font-size': 14.5, 'font-weight': 700, fill: mc(r.pca), opacity: op }); tx(XT, y, r.tu, { 'font-size': 14.5, 'font-weight': 700, fill: mc(r.tu), opacity: op }); }); }
  function mapDots(x, y, w, h, u, a, colored, o) { o = o || {}; const cl = [[0.22, 0.3, INFO], [0.7, 0.28, ACC], [0.45, 0.72, WARN], [0.85, 0.75, GOOD]];
    cl.forEach(([fx, fy, col], j) => { for (let i = 0; i < 16; i++) { const an = hsh(i + j * 30) * 6.283, r = Math.sqrt(hsh(i + j * 30 + 3)) * 26; dotAt(x + fx * w + Math.cos(an) * r, y + fy * h + Math.sin(an) * r * 0.75, 3.8, colored ? col : INK, (colored ? 0.85 : 0.5) * fade(u, a + i * 0.02)); } });
    if (o.island) for (let i = 0; i < 5; i++) dotAt(x + 0.7 * w + (hsh(i + 900) - 0.5) * 16, y + 0.28 * h + 6 + (hsh(i + 910) - 0.5) * 12, 3.8, WARN, fade(u, o.island)); }
  function s5(t, c) { const { k, u } = c; table(c);
    if (k === 0) { card(140, 110, 200, 56, { rx: 12, text: '축소한 결과를', fs: 16, s: pop(u, 0.2) });
      [['모델에 넣는다', 'PCA', ACC, 60], ['사람이 본다', 'UMAP', INFO, 160]].forEach(([a, b, col, y], i) => { grow(240, 110, 420, y, E(u, 0.6 + i * 0.5, 1.0 + i * 0.5), col);
        card(540, y, 220, 50, { rx: 10, text: a, fs: 16, stroke: col, s: pop(u, 0.9 + i * 0.5) }); pill(745, y, b, col, pop(u, 1.2 + i * 0.5), { fs: 16 }); });
      return; }
    if (k === 1) { for (let i = 0; i < 6; i++) { const x = 50 + (i % 3) * 34, y = 60 + Math.floor(i / 3) * 44, s = pop(u, 0.2 + i * 0.08); card(x + 14, y + 16, 28, 36, { rx: 3, s, stroke: MUT, sw: 1.5 }); }
      tx(40, 170, '고객 문의 8,000건', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) });
      grow(170, 100, 250, 100, E(u, 0.8, 1.1), ACC); card(340, 100, 160, 50, { rx: 10, text: 'encoder', fs: 16, mono: true, stroke: ACC, color: ACC, s: pop(u, 1.0) }); grow(425, 100, 505, 100, E(u, 1.3, 1.6), ACC);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 14; j++) el('rect', { x: 520 + j * 22, y: 62 + i * 14, width: 20, height: 12, fill: ACC, opacity: (0.15 + 0.6 * hsh(i * 14 + j)) * fade(u, 1.5 + i * 0.05) });
      mono(520, 170, 'emb (8000, 384)', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.9) });
      tx(760, 170, 'vector-db 에 넣는 그 벡터', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.1) }); return; }
    if (k === 2) { const st = [['emb', '(8000, 384)'], ['PCA(50)', ''], ['X_compact', '(8000, 50)']];
      st.forEach(([a, b], i) => { const x = 110 + i * 250; card(x, 90, 200, 62, { rx: 10, text: b ? a + '\n' + b : a, fs: 15, mono: true, stroke: i === 1 ? ACC : INK, color: i === 1 ? ACC : INK, s: pop(u, 0.2 + i * 0.4) }); if (i < 2) grow(x + 105, 90, x + 145, 90, E(u, 0.4 + i * 0.4, 0.7 + i * 0.4), ACC); });
      grow(710, 90, 760, 90, E(u, 1.4, 1.7), ACC); tx(770, 84, '분류기 입력', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); tx(770, 108, '검색 인덱스 경량화', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.7) });
      el('path', { d: 'M610,128 C610,180 110,180 110,128', fill: 'none', stroke: GOOD, 'stroke-width': 2, 'stroke-dasharray': '5 4', opacity: fade(u, 1.9) });
      tx(360, 194, 'inverse_transform 으로 되돌릴 수 있다 · 결정적', { 'text-anchor': 'middle', 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 2.1) }); return; }
    if (k >= 3) { // 지도
      const mx = 500, my = 22, mw = 420, mh = 186; el('rect', { x: mx, y: my, width: mw, height: mh, rx: 10, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
      mapDots(mx, my, mw, mh, u, k === 3 ? 0.8 : -1, k >= 4, { island: k >= 5 ? (k === 5 ? 1.2 : -1) : null });
      if (k === 3) { card(140, 70, 220, 54, { rx: 10, text: 'UMAP(n_neighbors=15)', fs: 14.5, mono: true, stroke: INFO, color: INFO, s: pop(u, 0.2) }); grow(255, 70, 330, 70, E(u, 0.5, 0.8), INFO);
        mono(40, 150, 'coords (8000, 2)', { 'font-size': 17, 'font-weight': 800, fill: INFO, opacity: fade(u, 1.4) }); tx(40, 182, '8000점도 수 초', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.7) }); }
      if (k === 4) { mono(40, 60, 'c=category_ids', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.2) }); tx(40, 100, '카테고리 색으로 한 장 점검', { 'font-size': 15, opacity: fade(u, 0.6) });
        tx(40, 150, '읽을 것: 뭉치는가 / 흩어지는가', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) }); tx(40, 180, '군집 사이 거리는 읽지 않는다', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.8) }); }
      if (k === 5) { el('circle', { cx: mx + 0.7 * mw, cy: my + 0.28 * mh + 6, r: 20, fill: 'none', stroke: BAD, 'stroke-width': 2.5, opacity: fade(u, 1.5) });
        R.check(60, 70, 10, pop(u, 0.3)); tx(84, 76, '같은 카테고리가 뭉친다 → 의미를 잡았다', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
        tx(40, 130, '엉뚱한 섬 (다른 색 무리)', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) }); tx(40, 158, '→ 라벨 오류 · 신규 토픽 후보', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.8) });
        tx(40, 196, '검색 품질 디버깅의 첫 도구', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); }
      if (k === 6) { const q = E(u, 0.6, 1.4), x = lerp(mx + mw - 20, mx + 0.45 * mw, q), y = lerp(my + 10, my + 0.72 * mh, q); if (u > 0.5) el('circle', { cx: x, cy: y, r: 8, fill: INK, stroke: PANEL, 'stroke-width': 2 });
        mono(40, 60, 'reducer.transform(', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) }); mono(40, 86, '    encoder.encode(new_docs))', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.2) });
        tx(40, 130, '새 문의를 이미 만든 지도 위에', { 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.4) });
        tx(40, 170, 't-SNE: 전체를 다시 계산해야 한다', { 'font-size': 15, fill: BAD, opacity: fade(u, 1.9) }); xm(28, 165, 7, BAD, fade(u, 1.9)); } } }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: "차원을 2 → 10 → 100 → 1000으로 키우면 최근접/최원접 거리 비율은 어떻게 되나?",
      o: ["0에 가까워진다 — 이웃이 더 뚜렷해진다", "1에 가까워진다 — 0.02에서 0.90까지 오른다", "차원과 상관없이 거의 일정하다"], a: 1,
      why: "2차원 0.02, 10차원 0.29, 100차원 0.71, 1000차원 0.90으로 1을 향해 간다. 최근접 이웃도 최원접만큼 멀어져 \"가깝다\"는 구분이 사라진다." },
    { q: "PCA를 돌리기 전에 StandardScaler로 표준화부터 하는 이유는 무엇인가?",
      o: ["단위가 큰 피처 하나가 PC1을 독차지하지 않게 하려고", "계산 속도를 높이려고", "PCA가 음수 값을 받지 못해서"], a: 0,
      why: "PCA는 분산을 본다. 표준화를 건너뛰면 \"원 단위 구매액\" 같은 큰 단위 피처 하나가 PC1을 통째로 차지한다." },
    { q: "스위스롤 데이터에 PCA를 적용해 2차원으로 찍으면 어떻게 되나?",
      o: ["나선이 색 순서대로 곱게 펴진다", "알고리즘이 수렴하지 못하고 에러를 낸다", "안쪽 파랑과 바깥쪽 주황이 같은 자리에 겹친다"], a: 2,
      why: "PCA는 직선 자로 눌러 찍는 선형 사영이다. 유클리드로는 가깝지만 종이 위로는 한 바퀴 떨어진 두 층이 같은 좌표로 포개진다." },
    { q: "t-SNE 그림을 보고 해서는 안 되는 해석은 무엇인가?",
      o: ["같은 카테고리 점들이 한 덩어리로 뭉쳐 있다", "\"A군집이 B군집보다 C군집에 더 가깝다\"", "perplexity를 바꿔 여러 번 돌려 봐야 한다"], a: 1,
      why: "t-SNE는 국소 이웃 관계만 보존한다. 군집 사이의 거리와 군집 크기는 의미가 없으므로 군집 간 거리 비교는 금지다." },
    { q: "384차원 임베딩을 분류기 입력용으로 50차원까지 줄일 때 알맞은 도구는 무엇인가?",
      o: ["t-SNE — 국소 구조를 가장 잘 살린다", "UMAP — 빠르고 transform()이 있다", "PCA — 변환이 결정적이라 train과 serving에서 똑같이 재현된다"], a: 2,
      why: "모델에 넣을 압축은 PCA다. t-SNE/UMAP 좌표는 시드·파라미터에 따라 통째로 바뀌므로 모델 피처로 쓰지 않고, 사람이 볼 지도에 쓴다." },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '차원이 1000이면 최근접 거리가 최원접의 90%까지 늘어나 거리 기반 방법이 흔들린다.',
    'PCA는 분산이 큰 방향으로 직선 사영한다. 말린 스위스롤은 두 층이 한 자리에 포개진다.',
    't-SNE와 UMAP은 이웃 관계를 지켜 펴 준다. 군집 사이 거리와 크기는 읽지 않는다.',
    '모델에 넣을 압축은 PCA로, 사람이 눈으로 볼 지도는 UMAP으로 만든다.',
  ];
  const review = [
    { q: '피처 1000개짜리 데이터에 kNN을 썼더니 이웃 판정이 엉망이다. 가장 맞는 설명은?',
      o: ['모든 점이 비슷하게 멀어져 가까운 이웃이 뜻을 잃었다', 'k를 너무 작게 잡았다', '표본이 너무 많아 계산이 틀렸다'], a: 0,
      why: '1000차원에서는 최근접 거리가 최원접의 90%까지 늘어난다. 차원을 줄여야 거리가 다시 뜻을 갖는다.' },
    { q: '문의 임베딩을 PCA로 2차원에 찍었더니 카테고리가 전부 뒤섞였다. 가장 맞는 다음 행동은?',
      o: ['임베딩에 구조가 없다고 보고 모델을 바꾼다', 'StandardScaler를 빼고 PCA를 다시 돌린다', '같은 임베딩을 UMAP으로 다시 찍어 본다'], a: 2,
      why: 'PCA는 직선 사영이라 휘어진 구조를 펴지 못하고 눌러 버린다. PCA 2D만 보고 구조가 없다고 결론 내리는 것이 가장 흔한 실패다.' },
    { q: '매일 들어오는 새 문의를 이미 만든 2D 지도에 얹어 보고 싶다. 가장 맞는 도구는?',
      o: ['t-SNE를 처음부터 다시 돌린다', 'UMAP의 transform()으로 얹는다', 'perplexity를 바꿔 t-SNE를 다시 돌린다'], a: 1,
      why: 't-SNE는 새 데이터를 변환할 수 없고, 다시 돌리면 그림이 통째로 바뀐다. UMAP은 transform()이 있어 만든 지도 위에 새 점을 그대로 놓는다.' },
  ];

  RA.page({ title: '차원 축소 실험실 — PCA · t-SNE · UMAP', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
