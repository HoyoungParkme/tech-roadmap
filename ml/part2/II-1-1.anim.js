/* II-1-1 선형·로지스틱 회귀 — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 무대의 주인공: 집값 산점도와 직선, 잔차 세로선과 잔차 제곱 정사각형, 0/1 라벨 위의 직선과 S곡선, 점별 우도 막대 */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot,
    zone, cross, check, axes, scatter, line, hbar } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 페이지 코드의 데이터 그대로 ----------
  const HX = [12, 16, 20, 24, 28, 33, 38, 42, 47, 52], HY = [2.1, 2.8, 3.2, 3.4, 4.1, 4.6, 5.3, 5.5, 6.4, 6.6];
  const EH = [1.0, 1.8, 2.4, 3.0, 3.6, 4.0, 4.5, 5.0, 5.6, 6.4, 7.2, 8.0], EY = [0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1];
  const ols = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let nu = 0, de = 0;
    xs.forEach((x, i) => { nu += (x - mx) * (ys[i] - my); de += (x - mx) ** 2; }); const b1 = nu / de; return { b0: my - b1 * mx, b1 }; };
  const NAIVE = { b0: 1.9, b1: 0.075 }, OLS = ols(HX, HY);
  const sse = (f) => HX.reduce((s, x, i) => s + (HY[i] - f.b0 - f.b1 * x) ** 2, 0);
  const sig = (z) => 1 / (1 + Math.exp(-z));
  const MLE = { w: 2.79, b: -10.54 }, FLAT = { w: 0.35, b: -1.2 };
  const pOf = (m, h) => sig(m.w * h + m.b);
  const lik = (m, i) => { const p = pOf(m, EH[i]); return EY[i] ? p : 1 - p; };
  const LL = (m) => EH.reduce((s, h, i) => s + Math.log(lik(m, i)), 0);
  const BADL = ols(EH, EY), PULLED = ols(EH.concat([20]), EY.concat([1]));     // 0/1 에 OLS, 그리고 20시간 합격자 1명을 더한 OLS
  const f2 = (v) => v.toFixed(2);

  // ---------- 집값 차트 ----------
  function houseAx(o) { o = o || {}; return axes(o.x ?? 80, o.y ?? 44, o.w ?? 440, o.h ?? 296, { x: [0, 60], y: [0, 8], xt: [0, 20, 40, 60], yt: [0, 2, 4, 6, 8], xl: '집 크기 (평)', yl: '매매가 (억원)', grid: true }); }
  const fit = (f, x) => f.b0 + f.b1 * x;
  function drawLine(a, f, u, col, o) { line(a, [[4, fit(f, 4)], [58, fit(f, 58)]], u, col, o); }
  function points(a, u) { scatter(a, HX.map((x, i) => [x, HY[i], INK]), { u, r: 6.5 }); }
  function residuals(a, f, g, o) { o = o || {}; HX.forEach((x, i) => { const y0 = fit(f, x), y1 = HY[i], r = y1 - y0, hot = o.hot && o.hot(i, r);
      const gg = typeof g === 'function' ? g(i) : g; if (gg <= 0) return;
      el('line', { x1: a.X(x), y1: a.Y(y0), x2: a.X(x), y2: a.Y(lerp(y0, y1, gg)), stroke: hot ? BAD : WARN, 'stroke-width': 3.2, 'stroke-linecap': 'round' }); }); }
  function squares(a, f, g) { const px = a.h / 8; HX.forEach((x, i) => { const y0 = fit(f, x), r = HY[i] - y0, s = Math.abs(r) * px * g; if (s < 0.5) return;
      el('rect', { x: a.X(x), y: Math.min(a.Y(HY[i]), a.Y(y0)) + (Math.abs(r) * px - s) * (r > 0 ? 1 : 0) * 0, width: s, height: s, fill: WARN, opacity: 0.22, stroke: WARN, 'stroke-width': 1.2 }); }); }
  // 잔차 막대 (오른쪽 칸)
  function resBars(x, y0, f, o) { o = o || {}; const sc = o.sc || 78, bw = 24, gap = 7;
    el('line', { x1: x - 6, y1: y0, x2: x + 10 * (bw + gap), y2: y0, stroke: MUT, 'stroke-width': 1.6 });
    mono(x - 12, y0 + 5, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' });
    HX.forEach((hx, i) => { const r = HY[i] - fit(f, hx), g = o.g ? o.g(i) : 1, h = r * sc * g, hot = o.hot && o.hot(i, r);
      el('rect', { x: x + i * (bw + gap), y: h > 0 ? y0 - h : y0, width: bw, height: Math.max(1, Math.abs(h)), rx: 3, fill: hot ? BAD : r > 0 ? WARN : INFO, opacity: o.dim && !hot ? 0.35 : 0.9 });
      if (o.labels && g > 0.9 && (i === 0 || i === 8)) mono(x + i * (bw + gap) + bw / 2, r > 0 ? y0 - h - 6 : y0 - h + 16, (r > 0 ? '+' : '') + r.toFixed(r === Math.round(r * 10) / 10 ? 1 : 2), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: o.labels }); }); }
  // 값 계기 (가로 막대 + 큰 숫자)
  function gauge(x, y, w, name, v, max, col, o) { o = o || {};
    tx(x, y, name, { 'font-size': 14.5, 'font-weight': 700, fill: MUT });
    el('rect', { x, y: y + 12, width: w, height: 16, rx: 4, fill: SOFT });
    el('rect', { x, y: y + 12, width: Math.max(2, w * clamp(Math.abs(v) / max)), height: 16, rx: 4, fill: col });
    mono(x + w + 10, y + 26, o.fmt ? o.fmt(v) : f2(v), { 'font-size': 18, 'font-weight': 800, fill: col }); }

  // =========================================================
  // 1. 잔차부터 정의
  // =========================================================
  function s1(t, c) { const { k, u } = c;
    const a = houseAx();
    points(a, k === 0 ? E(u, 0.2, 1.6) : 1);
    if (k === 0) { tx(720, 150, '관측 10건 · 12평 ~ 52평', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 1.4) });
      tx(720, 180, '눈으로는 우상향 — 직선은 아직 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.8) }); return; }
    drawLine(a, NAIVE, k === 1 ? E(u, 0.2, 1.4) : 1, ACC);
    pill(a.X(30), a.Y(7.4), 'ŷ = 1.9 + 0.075x', ACC, k === 1 ? pop(u, 1.2) : 1, { mono: true, fs: 14 });
    if (k === 1) { tx(720, 150, '근거: 느낌', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, opacity: fade(u, 1.6) });
      tx(720, 180, '이 직선이 좋은지 말할 방법이 아직 없다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    const hot = k === 3 ? (i) => i >= 4 : null;
    residuals(a, NAIVE, k === 2 ? (i) => E(u, 0.3 + i * 0.12, 0.7 + i * 0.12) : 1, { hot });
    if (k >= 2 && k <= 3) { tx(590, 64, '잔차 = 실제 − 예측', { 'font-size': 16, 'font-weight': 800 });
      resBars(600, 190, NAIVE, { g: k === 2 ? (i) => E(u, 0.3 + i * 0.12, 0.7 + i * 0.12) : null, labels: k === 2 ? fade(u, 1.8) : 1, hot, dim: k === 3 });
      if (k === 3) { el('rect', { x: a.X(26), y: a.Y(7.2), width: a.X(55) - a.X(26), height: a.Y(3.6) - a.Y(7.2), rx: 10, fill: 'none', stroke: BAD, 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: fade(u, 0.4) });
        banner(760, 330, '오른쪽 잔차 전부 + → 기울기 부족', pop(u, 1.2)); } }
    if (k === 4) { // 부호가 살아 있는 합: +3.1 과 −1.5 가 상쇄
      tx(590, 64, '잔차를 그냥 더하면', { 'font-size': 16, 'font-weight': 800 });
      const sc = 34, y = 150, x0 = 760; let xp = x0, xn = x0;
      HX.forEach((hx, i) => { const r = HY[i] - fit(NAIVE, hx), g = E(u, 0.3 + i * 0.1, 0.8 + i * 0.1), w = Math.abs(r) * sc;
        if (r > 0) { el('rect', { x: xp, y, width: w * g, height: 22, fill: WARN, stroke: PANEL, 'stroke-width': 1 }); xp += w * g; }
        else { el('rect', { x: xn - w * g, y: y + 30, width: w * g, height: 22, fill: INFO, stroke: PANEL, 'stroke-width': 1 }); xn -= w * g; } });
      el('line', { x1: x0, y1: y - 12, x2: x0, y2: y + 64, stroke: INK, 'stroke-width': 2 });
      mono(x0 + 4, y - 18, '+ 쪽', { 'font-size': 13.5, fill: WARN, 'font-weight': 700 }); mono(x0 - 4, y + 72, '− 쪽', { 'font-size': 13.5, fill: INFO, 'font-weight': 700, 'text-anchor': 'end' });
      mono(760, 250, '합 = 1.6', { 'font-size': 22, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      tx(760, 284, '+0.7 과 −0.7 은 서로 지운다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.1) }); }
    if (k === 5) { squares(a, NAIVE, E(u, 0.3, 1.5));
      tx(590, 64, '제곱하면 부호가 사라진다', { 'font-size': 16, 'font-weight': 800 });
      tx(590, 92, '큰 오차일수록 넓이가 커진다', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.6) });
      gauge(590, 160, 220, '잔차 제곱합 SSE (눈대중)', 2.866 * E(u, 0.6, 1.8), 3, WARN);
      tx(590, 260, '다음 목표: 이 넓이 합을 최소로', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); }
  }

  // =========================================================
  // 2. OLS
  // =========================================================
  function s2(t, c) { const { k, u } = c;
    const a = houseAx();
    // 직선: k2 에서 눈대중 → OLS 로 회전
    const g = k < 2 ? 0 : k === 2 ? E(u, 0.3, 1.8) : 1, f = { b0: lerp(NAIVE.b0, OLS.b0, g), b1: lerp(NAIVE.b1, OLS.b1, g) };
    if (k >= 2) drawLine(a, NAIVE, 1, MUT, { dash: '6 6', sw: 2 });
    if (k >= 1) squares(a, f, k === 1 ? E(u, 0.3, 1.4) : 1);
    residuals(a, f, 1);
    drawLine(a, f, 1, ACC);
    points(a, 1);
    pill(a.X(30), a.Y(7.4), g > 0.5 ? 'OLS: ŷ = 0.86 + 0.114x' : '눈대중: ŷ = 1.9 + 0.075x', g > 0.5 ? ACC : MUT, 1, { mono: true, fs: 14 });
    const RX = 590;
    if (k === 0) { // |e| 와 e² 의 모양
      const b = axes(RX + 30, 70, 260, 170, { x: [-3, 3], y: [0, 9], xt: [-3, 0, 3], yt: [0, 4, 9], xl: '오차 e' });
      const xs = Array.from({ length: 31 }, (_, i) => -3 + i * 0.2);
      line(b, xs.map((e) => [e, Math.abs(e)]), E(u, 0.2, 1.0), INFO, { sw: 2.6 });
      line(b, xs.map((e) => [e, e * e]), E(u, 0.9, 1.9), WARN, { sw: 3 });
      tx(b.X(-2.8), b.Y(3.6), '|e|', { 'font-size': 15, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.6) });
      tx(b.X(1.2), b.Y(8.4), 'e²', { 'font-size': 15, 'font-weight': 800, fill: WARN, opacity: fade(u, 1.5) });
      [['① 부호 상쇄가 없다', 0.5], ['② 2→4, 3→9 큰 오차에 벌점', 1.4], ['③ 매끈해서 미분 = 0 으로 풀린다', 2.0]].forEach(([s, a0], i) => tx(RX, 300 + i * 26, s, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a0) }));
      return; }
    if (k === 1) { tx(RX, 70, 'SSE = 정사각형 넓이의 합', { 'font-size': 16, 'font-weight': 800 });
      mono(RX, 100, 'Σ (yᵢ − b0 − b1·xᵢ)²', { 'font-size': 15, opacity: fade(u, 0.5) });
      mono(RX, 130, '∂SSE/∂b0 = 0, ∂SSE/∂b1 = 0', { 'font-size': 14.5, fill: ACC, opacity: fade(u, 1.2) });
      gauge(RX, 180, 220, 'SSE (눈대중)', 2.866, 3, WARN); return; }
    if (k === 2) { tx(RX, 70, '편미분 = 0 을 풀면 바로 나온다', { 'font-size': 16, 'font-weight': 800 });
      mono(RX, 102, 'b1 = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²', { 'font-size': 14.5, opacity: fade(u, 0.2) });
      mono(RX, 128, 'b0 = ȳ − b1·x̄', { 'font-size': 14.5, opacity: fade(u, 0.4) });
      mono(RX, 160, 'b0 ≈ 0.856, b1 ≈ 0.1136', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      const v = lerp(2.866, sse(OLS), E(u, 0.3, 1.8)); gauge(RX, 200, 220, 'SSE', v, 3, v < 1 ? GOOD : WARN); return; }
    if (k === 3) { // 설계행렬 X = [1, x]
      tx(RX, 66, '정규방정식  β = (XᵀX)⁻¹ Xᵀy', { 'font-size': 15.5, 'font-weight': 800, class: 'mono' });
      const mx = RX + 20, my = 92, rh = 21;
      tx(mx + 34, my, 'X', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' }); tx(mx + 160, my, 'y', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle' });
      HX.forEach((x, i) => { const op = fade(u, 0.2 + i * 0.08), yy = my + 22 + i * rh;
        mono(mx + 12, yy, '1', { 'font-size': 14, fill: ACC, 'font-weight': 800, opacity: op }); mono(mx + 56, yy, String(x), { 'font-size': 14, 'text-anchor': 'end', opacity: op });
        mono(mx + 172, yy, HY[i].toFixed(1), { 'font-size': 14, 'text-anchor': 'end', opacity: op }); });
      el('rect', { x: mx, y: my + 6, width: 70, height: 10 * rh + 4, rx: 6, fill: 'none', stroke: MUT, 'stroke-width': 1.5 });
      el('rect', { x: mx + 128, y: my + 6, width: 56, height: 10 * rh + 4, rx: 6, fill: 'none', stroke: MUT, 'stroke-width': 1.5 });
      tx(mx + 12, my + 10 * rh + 48, '↑ 절편 열', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.2) });
      mono(mx + 90, my + 10 * rh + 74, '→ β = [0.856, 0.1136]', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      tx(mx + 210, my + 120, 'inv 대신 solve', { 'font-size': 14, fill: MUT, opacity: fade(u, 2.0) }); return; }
    if (k === 4) { // SSE(b1) 단면: 최소점이 OLS
      const b = axes(RX + 30, 70, 270, 170, { x: [0.06, 0.17], y: [0, 6], yt: [0, 3, 6], xl: '기울기 b1', yl: 'SSE' });
      const mx = HX.reduce((s, v) => s + v) / 10, my = HY.reduce((s, v) => s + v) / 10;
      const prof = Array.from({ length: 23 }, (_, i) => { const b1 = 0.06 + i * 0.005; return [b1, sse({ b0: my - b1 * mx, b1 })]; });
      line(b, prof, E(u, 0.2, 1.4), ACC, { sw: 2.8 });
      const s = pop(u, 1.4); el('circle', { cx: b.X(OLS.b1), cy: b.Y(sse(OLS)), r: 7 * s, fill: GOOD });
      tx(b.X(OLS.b1), b.Y(sse(OLS)) - 14, '최소 0.17', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.5) });
      [['눈대중', 2.866, WARN], ['OLS', sse(OLS), GOOD]].forEach(([n, v, col], i) => { const y = 300 + i * 36;
        tx(RX, y + 14, n, { 'font-size': 15, 'font-weight': 700 }); hbar(RX + 70, y, 180, v * E(u, 0.3 + i * 0.4, 1.2 + i * 0.4), 3, { col, text: f2(v), h: 18 }); });
      return; }
    // k5 sklearn 대조
    [['numpy (닫힌 해)', '0.856', '0.1136', 0.3], ['sklearn LinearRegression', '0.856', '[0.1136]', 1.0]].forEach(([n, b0, b1, a0], i) => { const y = 90 + i * 110, s = pop(u, a0);
      card(RX + 160, y, 320, 84, { rx: 10, stroke: i ? INFO : ACC, sw: 2, s });
      tx(RX + 16, y - 16, n, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, a0) });
      mono(RX + 16, y + 18, 'b0 = ' + b0 + '   b1 = ' + b1, { 'font-size': 15, 'font-weight': 800, opacity: fade(u, a0 + 0.2) }); });
    check(RX + 160, 310, 14, pop(u, 1.8)); tx(RX + 160, 350, '같은 최소제곱 해', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: fade(u, 1.9) });
  }

  // =========================================================
  // 3. 0/1 에 직선 → 시그모이드
  // =========================================================
  function examAx(o) { o = o || {}; const a = axes(o.x ?? 80, o.y ?? 40, o.w ?? 440, o.h ?? 290, { x: [0, 9], y: [-0.35, 1.35], xt: [0, 2, 4, 6, 8], yt: [0, 0.5, 1], xl: '공부 시간 (h)', yl: '합격 = 1', grid: true });
    if (o.bands !== false) { el('rect', { x: a.x, y: a.Y(1.35), width: a.w, height: a.Y(1) - a.Y(1.35), fill: C.BADBG, opacity: o.bandOp ?? 1 });
      el('rect', { x: a.x, y: a.Y(0), width: a.w, height: a.Y(-0.35) - a.Y(0), fill: C.BADBG, opacity: o.bandOp ?? 1 }); }
    return a; }
  function examPts(a, u, o) { o = o || {}; EH.forEach((h, i) => { const s = clamp((u ?? 1) * 12 - i); if (s <= 0) return; const hot = o.hot && o.hot(i);
      el('circle', { cx: a.X(h), cy: a.Y(EY[i]), r: 7 * (0.4 + 0.6 * s), fill: EY[i] ? GOOD : PANEL, stroke: EY[i] ? GOOD : INK, 'stroke-width': 2.2 });
      if (hot) el('circle', { cx: a.X(h), cy: a.Y(EY[i]), r: 13, fill: 'none', stroke: BAD, 'stroke-width': 2.5 }); }); }
  const linPts = (f, x0, x1) => [[x0, f.b0 + f.b1 * x0], [x1, f.b0 + f.b1 * x1]];
  const curvePts = (m) => Array.from({ length: 46 }, (_, i) => { const h = i * 0.2; return [h, pOf(m, h)]; });
  function s3(t, c) { const { k, u } = c;
    const a = examAx({ bandOp: k === 0 ? fade(u, 1.4) : 1 });
    examPts(a, k === 0 ? E(u, 0.2, 1.4) : 1);
    if (k === 0) { tx(a.X(4.5), a.Y(1.24), '확률이 될 수 없는 구간', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 1.6) });
      tx(720, 140, '공부 시간 12건', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.6) });
      tx(720, 168, 'y 는 0 또는 1 — 집값이 아니다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 1.0) });
      el('circle', { cx: 640, cy: 220, r: 7, fill: GOOD }); tx(654, 225, '합격 (1)', { 'font-size': 14.5 });
      el('circle', { cx: 750, cy: 220, r: 7, fill: PANEL, stroke: INK, 'stroke-width': 2.2 }); tx(764, 225, '불합격 (0)', { 'font-size': 14.5 }); return; }
    const badOp = k >= 3 ? 0.55 : 1;
    if (k !== 2) line(a, linPts(BADL, 0, 9), k === 1 ? E(u, 0.2, 1.4) : 1, MUT, { sw: 2.8, dash: '7 5', op: badOp });
    if (k === 1) { const p9 = BADL.b0 + BADL.b1 * 9, p05 = BADL.b0 + BADL.b1 * 0.5; void p9; void p05;
      el('circle', { cx: a.X(9), cy: a.Y(1.45 > 1.35 ? 1.35 : 1.45), r: 0 });
      // 9시간은 그래프 위쪽 밖(1.45) → 가장자리에 화살표로 표시
      pill(a.X(7.4), a.Y(1.24), '9h → 1.45', BAD, pop(u, 1.3), { mono: true, fs: 14 });
      pill(a.X(1.3), a.Y(-0.24), '0.5h → −0.14', BAD, pop(u, 1.7), { mono: true, fs: 14 });
      tx(720, 150, '0/1 을 숫자로 보고 OLS', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) });
      tx(720, 180, '1 을 넘고 음수도 나온다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 2.0) }); return; }
    if (k === 2) { // 20시간 합격자 1명이 직선을 끌어당긴다
      const g = E(u, 0.6, 1.8), f = { b0: lerp(BADL.b0, PULLED.b0, g), b1: lerp(BADL.b1, PULLED.b1, g) };
      line(a, linPts(BADL, 0, 9), 1, MUT, { sw: 2, dash: '5 6', op: 0.6 });
      line(a, linPts(f, 0, 9), 1, BAD, { sw: 3 });
      const bd0 = (0.5 - BADL.b0) / BADL.b1, bd1 = (0.5 - f.b0) / f.b1;
      el('line', { x1: a.X(bd0), y1: a.Y(-0.3), x2: a.X(bd0), y2: a.Y(1.3), stroke: MUT, 'stroke-width': 1.6, 'stroke-dasharray': '4 5' });
      el('line', { x1: a.X(bd1), y1: a.Y(-0.3), x2: a.X(bd1), y2: a.Y(1.3), stroke: BAD, 'stroke-width': 2.2, 'stroke-dasharray': '4 5', opacity: fade(u, 0.8) });
      pill(a.X(7.9), a.Y(1.22), '20h 합격 →', BAD, pop(u, 0.3), { fs: 14 });
      tx(720, 140, '멀리 있는 점 하나에', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.5) });
      tx(720, 168, '제곱 벌점이 크게 걸린다', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.7) });
      tx(720, 230, '한 명 때문에 y = 0.5 경계가 움직인다', { 'text-anchor': 'middle', 'font-size': 15, fill: BAD, 'font-weight': 700, opacity: fade(u, 1.9) }); return; }
    if (k === 3) { // σ(z) 정의 (오른쪽 작은 그림)
      const b = axes(640, 80, 260, 180, { x: [-6, 6], y: [0, 1], xt: [-6, 0, 6], yt: [0, 0.5, 1], xl: 'z' });
      const zs = Array.from({ length: 49 }, (_, i) => -6 + i * 0.25);
      line(b, zs.map((z) => [z, sig(z)]), E(u, 0.2, 1.5), ACC, { sw: 3 });
      el('circle', { cx: b.X(0), cy: b.Y(0.5), r: 6 * pop(u, 1.5), fill: ACC });
      mono(b.X(0) + 12, b.Y(0.5) + 22, 'σ(0) = 0.5', { 'font-size': 14, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.6) });
      mono(640, 56, 'σ(z) = 1 / (1 + e^(−z))', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2) });
      tx(640, 330, '어떤 실수 z 도 (0, 1) 안으로', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) }); return; }
    // k >= 4: S곡선
    line(a, curvePts(MLE), k === 4 ? E(u, 0.2, 1.6) : 1, ACC, { sw: 3.4 });
    if (k === 4) { mono(720, 120, 'p = σ(2.79h − 10.54)', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.2) });
      tx(720, 152, 'LogisticRegression(penalty=None)', { 'text-anchor': 'middle', 'font-size': 14, fill: MUT, class: 'mono', opacity: fade(u, 1.4) });
      tx(720, 210, 'S곡선은 붉은 띠를 넘지 않는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }
    if (k === 5) { [[2, '0.007'], [4, '0.65'], [6, '0.998']].forEach(([h, s], i) => { const p = pOf(MLE, h), sc = pop(u, 0.3 + i * 0.45);
        el('line', { x1: a.X(h), y1: a.Y(-0.35), x2: a.X(h), y2: a.Y(p), stroke: INFO, 'stroke-width': 1.8, 'stroke-dasharray': '4 4', opacity: sc > 0 ? 1 : 0 });
        el('circle', { cx: a.X(h), cy: a.Y(p), r: 7 * sc, fill: INFO });
        mono(720, 120 + i * 34, h + '시간 → ' + s, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.4 + i * 0.45) }); });
      tx(720, 240, '모두 (0,1) 안 → 합격 확률로 읽는다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.9) }); }
    if (k === 6) { const bd = -MLE.b / MLE.w, g = E(u, 0.2, 1.0);
      el('line', { x1: a.X(bd), y1: a.Y(-0.35), x2: a.X(bd), y2: a.Y(lerp(-0.35, 1.35, g)), stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '6 5' });
      el('rect', { x: a.X(bd), y: a.Y(1.35), width: a.X(9) - a.X(bd), height: a.Y(-0.35) - a.Y(1.35), fill: GOOD, opacity: 0.07 * fade(u, 1.0) });
      tx(a.X(bd) + 14, a.Y(0.3), '합격 예측', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 1.2) });
      tx(a.X(bd) - 14, a.Y(0.75), '불합격 예측', { 'font-size': 14.5, 'font-weight': 700, fill: MUT, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      mono(720, 120, 'σ(z) = 0.5  ⇔  z = 0', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) });
      mono(720, 152, 'hours = −b/w ≈ 3.8', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
      tx(720, 210, '확률을 회귀한 뒤 0.5 로 자른다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.6) }); }
  }

  // =========================================================
  // 4. MLE — 점별 우도 막대
  // =========================================================
  function s4(t, c) { const { k, u } = c;
    // 곡선 파라미터: k3 평평, k4 다시 가파르게
    let m = MLE;
    if (k === 3) { const g = E(u, 0.2, 1.4); m = { w: lerp(MLE.w, FLAT.w, g), b: lerp(MLE.b, FLAT.b, g) }; }
    if (k === 4) { const g = E(u, 0.2, 1.4); m = { w: lerp(FLAT.w, MLE.w, g), b: lerp(FLAT.b, MLE.b, g) }; }
    const a = axes(80, 34, 440, 190, { x: [0, 9], y: [0, 1], xt: [0, 2, 4, 6, 8], yt: [0, 0.5, 1], yl: '합격 확률', grid: true });
    line(a, curvePts(m), 1, ACC, { sw: 3.2 });
    examPts(a, 1, { hot: k === 7 ? (i) => i === 5 : null });
    mono(a.X(9), a.Y(0.12), '공부 시간 (h)', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end', opacity: 0 });
    const BY = 395, BH = 120, showBars = k >= 2;
    if (showBars) { // 점별 우도 (k6~7 은 로그 기여도)
      const logMode = k >= 6;
      el('line', { x1: a.x, y1: BY, x2: a.x + a.w, y2: BY, stroke: MUT, 'stroke-width': 1.6 });
      if (!logMode) { el('line', { x1: a.x, y1: BY - BH * 0.5, x2: a.x + a.w, y2: BY - BH * 0.5, stroke: GRID, 'stroke-dasharray': '3 4' }); mono(a.x - 8, BY - BH * 0.5 + 5, '0.5', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); mono(a.x - 8, BY - BH + 5, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); }
      EH.forEach((h, i) => { const L = lik(m, i), g = k === 2 ? E(u, 0.3 + i * 0.08, 0.8 + i * 0.08) : 1, x = a.X(h) - 9;
        if (!logMode) { const hh = BH * L * g; el('rect', { x, y: BY - hh, width: 18, height: Math.max(1, hh), rx: 3, fill: L < 0.5 ? BAD : GOOD, opacity: 0.85 }); }
        else { const lg = Math.log(L), hh = Math.min(BH, -lg * 100) * (k === 6 ? E(u, 0.3 + i * 0.08, 0.8 + i * 0.08) : 1), top = BY - BH;
          el('rect', { x, y: top, width: 18, height: Math.max(1, hh), rx: 3, fill: lg < -0.5 ? BAD : WARN, opacity: 0.85 });
          if (lg < -0.5) mono(a.X(h) + (i === 4 ? -12 : 12), top + hh + 16, lg.toFixed(2), { 'font-size': 13.5, 'font-weight': 800, fill: BAD, 'text-anchor': i === 4 ? 'end' : 'start', opacity: k === 6 ? fade(u, 1.6) : 1 }); } });
      tx(a.x, BY - BH - 10, logMode ? '점별 log 우도 (아래로 길수록 큰 감점)' : '점별 우도: 합격자 p · 불합격자 1−p', { 'font-size': 14, 'font-weight': 700, fill: MUT }); }
    const RX = 590;
    if (k === 0) { tx(RX, 80, '질문을 뒤집는다', { 'font-size': 17, 'font-weight': 800, opacity: fade(u, 0.3) });
      tx(RX, 112, '"이 w, b 였다면 지금 본 합격·불합격이', { 'font-size': 15, opacity: fade(u, 0.8) });
      tx(RX, 136, '나올 확률은 얼마인가?"', { 'font-size': 15, opacity: fade(u, 0.8) });
      pill(RX + 150, 200, '이번엔 sklearn 없이 직접 계산', ACC, pop(u, 1.6), { fs: 14 }); return; }
    if (k === 1) { pill(RX + 80, 100, '평가 기준: SSE', OFF, pop(u, 0.3), { fs: 15 }); if (u > 0.9) cross(RX + 170, 100, 11, pop(u, 0.9));
      grow(RX + 80, 128, RX + 80, 170, E(u, 1.1, 1.5), ACC);
      pill(RX + 80, 196, '평가 기준: 우도', ACC, pop(u, 1.5), { fs: 15 });
      tx(RX, 260, 'sigmoid 는 그대로 — 확률을 만드는 도구', { 'font-size': 15, fill: MUT, opacity: fade(u, 2.0) }); return; }
    const ll = LL(m);
    if (k === 2) { mono(RX, 80, 'ℓ = Σ log(우도)', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.2) });
      tx(RX, 110, '확률 12개의 곱은 금방 0 에 가까워진다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.5) });
      tx(RX, 134, '→ 로그를 취해 합으로 바꾼다', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) });
      tx(RX, 190, '막대가 짧을수록 그 관측을 못 설명한 것', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k <= 5) { const lab = k === 3 ? '후보 A  w=0.35, b=−1.2' : '후보 B  w=2.79, b=−10.54';
      mono(RX, 78, lab, { 'font-size': 15, 'font-weight': 800, fill: k === 3 ? WARN : ACC });
      gauge(RX, 120, 200, '로그 우도 ℓ (0 에 가까울수록 좋다)', ll, 9, k === 3 ? WARN : GOOD, { fmt: (v) => v.toFixed(2) });
      if (k === 3) tx(RX, 200, '평평한 곡선 — 확률이 0.30~0.83 에 머문다', { 'font-size': 14.5, fill: WARN, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (k === 4) tx(RX, 200, 'ℓ 이 최대인 점 = MLE 해', { 'font-size': 15, fill: GOOD, 'font-weight': 700, opacity: fade(u, 1.6) });
      if (k === 5) { mono(RX, 210, 'log_loss = −ℓ / n', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
        mono(RX, 240, '0.193 = 2.32 / 12', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.9) });
        tx(RX, 276, '우도 최대화 = 크로스엔트로피 최소화', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.5) }); }
      return; }
    if (k === 6) { tx(RX, 80, '누가 점수를 깎았나', { 'font-size': 17, 'font-weight': 800 });
      tx(RX, 110, '각 점의 log 우도 = 감점', { 'font-size': 15, fill: MUT, opacity: fade(u, 0.4) });
      tx(RX, 150, '합격 쪽으로 기운 곡선에 걸린', { 'font-size': 15, opacity: fade(u, 1.6) }); tx(RX, 174, '두 점이 감점의 대부분', { 'font-size': 15, opacity: fade(u, 1.6) }); return; }
    // k7
    pill(RX + 150, 90, '4.0h 불합격 · p = 0.65', BAD, pop(u, 0.3), { fs: 15 });
    mono(RX + 150, 140, 'log(1 − 0.65) = −1.05', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: BAD, opacity: fade(u, 0.8) });
    tx(RX + 150, 186, '모델이 가장 뜻밖이라 여긴 관측이', { 'text-anchor': 'middle', 'font-size': 15, opacity: fade(u, 1.3) });
    tx(RX + 150, 210, '학습 방향을 주도한다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.3) });
  }

  // =========================================================
  // 5. OLS = 가우시안 MLE · 규제 예고
  // =========================================================
  function bell(cx, cy, s, amp, op) { const pts = []; for (let i = -24; i <= 24; i++) { const dy = i * s / 8; pts.push([cx + amp * Math.exp(-(dy * dy) / (2 * s * s)), cy + dy]); }
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: INFO, 'stroke-width': 2.2, opacity: op });
    el('line', { x1: cx, y1: cy - 3 * s, x2: cx, y2: cy + 3 * s, stroke: INFO, 'stroke-width': 1, opacity: op * 0.6 }); }
  function s5(t, c) { const { k, u } = c, RX = 590;
    if (k <= 3) { const a = houseAx(), mx = HX.reduce((s, v) => s + v) / 10, my = HY.reduce((s, v) => s + v) / 10;
      if (k === 2) { // 기울기 95% 신뢰구간 (0.105 ~ 0.122)
        const lo = { b0: my - 0.105 * mx, b1: 0.105 }, hi = { b0: my - 0.122 * mx, b1: 0.122 }, g = E(u, 0.8, 1.6);
        el('path', { d: `M${a.X(4)},${a.Y(fit(lo, 4))} L${a.X(mx)},${a.Y(my)} L${a.X(4)},${a.Y(lerp(fit(lo, 4), fit(hi, 4), g))} Z M${a.X(58)},${a.Y(fit(lo, 58))} L${a.X(mx)},${a.Y(my)} L${a.X(58)},${a.Y(lerp(fit(lo, 58), fit(hi, 58), g))} Z`, fill: ACC, opacity: 0.16 }); }
      drawLine(a, OLS, 1, ACC); points(a, 1);
      if (k === 3) [16, 30, 44].forEach((x, i) => bell(a.X(x), a.Y(fit(OLS, x)), 22, 34, fade(u, 0.3 + i * 0.3)));
      if (k === 0) { tx(RX, 90, '같은 집값 데이터, 목적이 다르다', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) });
        [['sklearn', '예측기 — 새 집값을 맞힌다', OFF], ['statsmodels', '보고서 — 계수를 해석한다', ACC]].forEach(([n, d, col], i) => { const y = 150 + i * 70, s = pop(u, 0.6 + i * 0.5);
          card(RX + 160, y, 320, 54, { rx: 10, stroke: col, sw: 2, s }); mono(RX + 16, y - 2, n, { 'font-size': 15, 'font-weight': 800, fill: col === OFF ? INK : col, opacity: fade(u, 0.7 + i * 0.5) });
          tx(RX + 16, y + 18, d, { 'font-size': 14, fill: MUT, opacity: fade(u, 0.7 + i * 0.5) }); }); return; }
      if (k === 1 || k === 2) { // summary 보고서
        const lines = [['coef  const 0.8558 · x1 0.1136', 0], ['P>|t|  0.000', 1], ['95% CI  0.105 ~ 0.122', 2], ['R²  0.992', 3]];
        el('rect', { x: RX - 10, y: 50, width: 360, height: 196, rx: 10, fill: SOFT, stroke: GRID, 'stroke-width': 1.5, opacity: k === 1 ? fade(u, 0.2) : 1 });
        mono(RX + 4, 76, 'sm.OLS(y, sm.add_constant(x))', { 'font-size': 14, fill: MUT, opacity: k === 1 ? fade(u, 0.3) : 1 });
        lines.forEach(([s, i]) => { const op = k === 1 ? fade(u, 0.8 + i * 0.3) : 1, hot = k === 2;
          if (hot) el('rect', { x: RX - 2, y: 98 + i * 36, width: 344, height: 30, rx: 6, fill: ACCBG, opacity: fade(u, 0.2 + i * 0.3) });
          mono(RX + 6, 119 + i * 36, s, { 'font-size': 15, 'font-weight': hot ? 800 : 500, opacity: op }); });
        if (k === 2) { gauge(RX, 290, 220, 'R² — 직선이 설명한 분산', 0.992 * E(u, 0.3, 1.5), 1, GOOD, { fmt: (v) => v.toFixed(3) });
          tx(RX, 372, '음영 = 기울기 95% 신뢰구간', { 'font-size': 14.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 1.6) }); }
        else tx(RX, 290, '계수는 v2 numpy 결과와 같다', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.0) });
        return; }
      // k3 가우시안 노이즈
      mono(RX, 80, 'y = b0 + b1·x + ε,  ε ~ N(0, σ²)', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.3) });
      mono(RX, 130, 'log L = −n/2·log(2πσ²)', { 'font-size': 14.5, opacity: fade(u, 1.0) });
      mono(RX + 92, 156, '− SSE / (2σ²)', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.3) });
      banner(RX + 170, 240, '최대화 = SSE 최소화 → OLS 는 MLE', pop(u, 1.9)); return; }
    if (k === 4) { // 같은 지도: 두 행
      const rows = [['선형 회귀', '가우시안 N(0,σ²)', '잔차 제곱합 (OLS)', INFO], ['로지스틱 회귀', '베르누이 (0/1)', '크로스엔트로피', GOOD]];
      [['모델', 60], ['노이즈 가정', 280], ['MLE ⇒ 손실', 560]].forEach(([h, x]) => tx(x, 70, h, { 'font-size': 14.5, 'font-weight': 700, fill: MUT }));
      rows.forEach(([m, n, l, col], i) => { const y = 100 + i * 80, op = i === 0 ? 1 : fade(u, 0.4);
        el('rect', { x: 46, y, width: 870, height: 62, rx: 10, fill: i ? ACCBG : SOFT, opacity: op });
        tx(60, y + 37, m, { 'font-size': 16, 'font-weight': 800, opacity: op }); tx(280, y + 37, n, { 'font-size': 15, opacity: op });
        grow(470, y + 31, 545, y + 31, i === 0 ? 1 : E(u, 0.8, 1.3), col); tx(560, y + 37, l, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: i === 0 ? 1 : fade(u, 1.2) }); });
      // 베르누이 막대 미니: p 와 1−p
      const bx = 300, by = 340; [0.65, 0.38].forEach((p, i) => { const x = bx + i * 220, op = fade(u, 1.5 + i * 0.3);
        el('rect', { x, y: by - 40 * p, width: 26, height: 40 * p, fill: GOOD, opacity: op }); el('rect', { x: x + 30, y: by - 40 * (1 - p), width: 26, height: 40 * (1 - p), fill: OFF, opacity: op });
        mono(x + 64, by - 6, i ? '3.6h: p = 0.38' : '4.0h: p = 0.65', { 'font-size': 14, opacity: op }); });
      tx(480, 400, 'sm.Logit 계수 [−10.54, 2.79] = sklearn(규제 없음)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); return; }
    if (k === 5) { const rows = [['질문', '잔차 제곱합이 최소인 직선은?', '관측이 가장 그럴듯한 파라미터는?'], ['해법', '닫힌 해 (정규방정식) 한 번', '보통 반복 최적화 (경사하강 등)'], ['관계', '가우시안 노이즈 가정의 MLE', '노이즈 분포를 바꾸면 손실이 바뀜']];
      tx(250, 64, 'OLS', { 'font-size': 18, 'font-weight': 800, fill: INFO, 'text-anchor': 'middle' }); tx(680, 64, 'MLE', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle' });
      rows.forEach(([h, a1, a2], i) => { const y = 92 + i * 62, op = fade(u, 0.3 + i * 0.4);
        el('rect', { x: 30, y, width: 900, height: 50, rx: 8, fill: SOFT, opacity: op });
        tx(46, y + 31, h, { 'font-size': 15, 'font-weight': 800, opacity: op }); tx(250, y + 31, a1, { 'font-size': 15, 'text-anchor': 'middle', opacity: op }); tx(680, y + 31, a2, { 'font-size': 15, 'text-anchor': 'middle', opacity: op }); });
      pill(480, 320, 'make_pipeline(StandardScaler(), Ridge())', ACC, pop(u, 1.7), { mono: true, fs: 14 });
      tx(480, 366, '단위가 다른 특성은 스케일링부터 — 규제가 공정해진다', { 'text-anchor': 'middle', 'font-size': 15, fill: MUT, opacity: fade(u, 2.1) }); return; }
    // k6 규제: 계수 공간의 SSE 등고선 + L2 원 / L1 마름모
    [['Ridge = SSE + L2', 250, 'circle'], ['Lasso = SSE + L1', 710, 'diamond']].forEach(([title, cx, sh], i) => { const cy = 220, s = pop(u, 0.3 + i * 0.6), op = fade(u, 0.3 + i * 0.6);
      el('line', { x1: cx - 130, y1: cy, x2: cx + 130, y2: cy, stroke: MUT, 'stroke-width': 1.4, opacity: op }); el('line', { x1: cx, y1: cy + 120, x2: cx, y2: cy - 130, stroke: MUT, 'stroke-width': 1.4, opacity: op });
      mono(cx + 124, cy + 20, 'β1', { 'font-size': 14, fill: MUT, opacity: op }); mono(cx + 8, cy - 116, 'β2', { 'font-size': 14, fill: MUT, opacity: op });
      [1, 1.5, 2.05].forEach((r) => el('ellipse', { cx: cx + 70, cy: cy - 70, rx: 34 * r, ry: 20 * r, transform: `rotate(-30 ${cx + 70} ${cy - 70})`, fill: 'none', stroke: WARN, 'stroke-width': 1.8, opacity: op }));
      el('circle', { cx: cx + 70, cy: cy - 70, r: 4, fill: WARN, opacity: op });
      if (sh === 'circle') el('circle', { cx, cy, r: 52 * s, fill: INFO, opacity: 0.18, stroke: INFO, 'stroke-width': 2 });
      else el('path', { d: `M${cx},${cy - 58 * s} L${cx + 58 * s},${cy} L${cx},${cy + 58 * s} L${cx - 58 * s},${cy} Z`, fill: GOOD, opacity: 0.2, stroke: GOOD, 'stroke-width': 2 });
      el('circle', sh === 'circle' ? { cx: cx + 36.8 * s, cy: cy - 36.8 * s, r: 6, fill: INK, opacity: fade(u, 1.0 + i * 0.6) } : { cx, cy: cy - 58 * s, r: 6, fill: INK, opacity: fade(u, 1.0 + i * 0.6) });
      lbl(cx, 60, title, op, { fill: i ? GOOD : INFO, 'font-size': 16 });
      tx(cx, 380, i ? '모서리에서 만나 일부 계수가 정확히 0' : '계수를 고르게 줄인다', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.4 + i * 0.4) }); });
  }

  // 장면(Step)마다 확인 문제 하나 — 답(a)은 0부터, why 는 맞혔을 때 보이는 해설
  const quiz = [
    { q: '잔차를 부호 그대로 더해 직선을 평가하면 무엇이 문제인가?',
      o: ['큰 오차에 벌점이 지나치게 붙는다', '+와 −가 상쇄되어 나쁜 직선도 좋아 보일 수 있다', '점이 10개뿐이라 계산이 안 된다'], a: 1,
      why: '+0.7 과 −0.7 은 서로 지운다. 부호가 살아 있는 한 어떤 합계도 믿을 수 없어 제곱으로 부호를 없앤다.' },
    { q: 'OLS 가 반복 학습 없이 공식 한 번으로 직선을 구할 수 있는 이유는?',
      o: ['SSE 를 미분해 0으로 놓으면 닫힌 해(정규방정식)가 나와서', '절댓값 오차를 써서', '경사하강을 한 번만 돌려서'], a: 0,
      why: '제곱은 미분 가능해 편미분을 0으로 놓으면 b0, b1 이 바로 나온다. 눈대중 SSE 2.87 이 OLS 에서 최소값 0.17 로 떨어진다.' },
    { q: '로지스틱 회귀가 직선의 출력 z 를 시그모이드에 통과시키는 이유는?',
      o: ['계산을 빠르게 하려고', '가중치의 부호·크기 해석을 없애려고', '어떤 값이든 (0,1) 사이 확률로 눌러 담으려고'], a: 2,
      why: '0/1 에 그은 OLS 직선은 9시간에 1.45, 0.5시간에 −0.14 처럼 확률 범위를 벗어난다. 시그모이드 S곡선은 항상 (0,1) 안에 머문다.' },
    { q: '로지스틱 회귀가 제곱오차 대신 로그 우도(크로스엔트로피)를 쓰는 이유는?',
      o: ['로그 우도가 계산이 더 단순해서', '시그모이드에 제곱오차를 쓰면 비볼록해져 지역 최소에 갇힐 수 있어서', '제곱오차는 0/1 라벨에서 항상 0 이 되어서'], a: 1,
      why: '로그 우도 최대화는 크로스엔트로피 최소화와 같은 식이고 볼록이라 전역 최적이 보장된다. 학습된 후보(−2.32)가 덜 학습된 후보(−5.50)보다 우도가 높다.' },
    { q: '노이즈를 가우시안(종 모양)으로 가정하고 MLE 를 풀면 무엇이 되나?',
      o: ['OLS — 잔차 제곱합 최소화', '크로스엔트로피 최소화', 'Lasso(L1) 규제'], a: 0,
      why: '노이즈가 N(0,σ²) 이면 로그 우도의 β 의존 항이 −SSE/(2σ²) 뿐이라 최대화가 곧 SSE 최소화다. 베르누이(0/1)를 가정하면 크로스엔트로피가 나온다.' },
  ];

  // 완료 화면: 정리는 짧은 문장 3~4개, 복습 문제는 장면을 넘나드는 3개
  const summary = [
    '좋은 직선은 잔차로 잰다. 잔차는 실제값에서 예측값을 뺀 값이다.',
    'OLS는 잔차 제곱합이 가장 작은 직선을 공식 한 번으로 구한다. 눈대중 SSE 2.87이 0.17로 줄었다.',
    '0과 1 라벨에 직선을 그으면 확률 범위를 벗어난다. 로지스틱 회귀는 시그모이드로 출력을 구부린다.',
    '로지스틱은 로그 우도를 최대로 하는 값을 찾는다. 노이즈를 종 모양으로 두면 같은 계산이 OLS가 된다.',
  ];
  const review = [
    { q: '평수로 집값을 예측한 직선의 잔차를 보니 큰 집 구간에서 전부 양수다. 이 직선은 어떤 상태인가?',
      o: ['노이즈가 커서 어떤 직선으로도 못 줄인다', '기울기가 모자라 큰 집을 늘 낮게 예측한다', '잔차 제곱합이 이미 최소인 OLS 직선이다'], a: 1,
      why: '한 방향으로 쏠린 잔차는 모델이 놓친 패턴이 있다는 신호다. OLS로 다시 맞추면 기울기가 커지고 SSE가 줄어든다.' },
    { q: '단위가 제각각인 특성 여러 개에 스케일링 없이 Ridge 규제를 걸었다. 무엇이 문제인가?',
      o: ['OLS의 닫힌 해가 더는 존재하지 않는다', '출력이 시그모이드를 거쳐 확률로 바뀐다', '규제가 일부 계수만 유독 세게 눌러 비교가 왜곡된다'], a: 2,
      why: '규제는 계수 크기에 벌점을 매기는데, 계수 크기는 특성 단위에 따라 달라진다. 그래서 스케일링을 파이프라인 안에 넣는다.' },
    { q: '고객 이탈(0 또는 1)을 예측한다. 손실 함수로 가장 맞는 것은?',
      o: ['시그모이드 출력에 크로스엔트로피를 쓴다', '0과 1 라벨에 그대로 OLS 직선을 맞춘다', '시그모이드 출력에 제곱오차를 쓴다'], a: 0,
      why: '0과 1로 나뉘는 결과는 베르누이 노이즈라 우도를 세우면 크로스엔트로피가 나온다. 직선은 확률 범위를 벗어나고, 시그모이드에 제곱오차를 쓰면 비볼록이 된다.' },
  ];

  R.page({ title: '회귀 피팅 시뮬레이션 — 잔차·S곡선·우도', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
