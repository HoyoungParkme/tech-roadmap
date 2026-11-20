/* V-1-2 교차검증과 하이퍼파라미터 튜닝 — 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, lock, axes, line } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  // 결정적 의사 난수 (시드 → 0~1)
  const rnd = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  const pct = (v) => v.toFixed(1) + '%';

  // =========================================================
  // 1. 단일 split — 시드가 성적을 정한다
  // =========================================================
  const SEEDS = [0, 7, 13, 42, 99], NC = 20;
  const testIdx = (seed) => { const idx = [...Array(NC).keys()].sort((a, b) => rnd(seed + 1, a) - rnd(seed + 1, b)); return new Set(idx.slice(0, 4)); };
  const AX1 = { x0: 560, x1: 920, lo: 90, hi: 98 }, AX = (v) => lerp(AX1.x0, AX1.x1, (v - AX1.lo) / (AX1.hi - AX1.lo));
  function s1(t, c) { const { k, u } = c, rows = c.beat.splitTrials.rows, prows = c.prev ? c.prev.splitTrials.rows : [];
    if (k === 0) { // 데이터 행렬 + 모델
      const op = fade(u, 0.2); for (let r = 0; r < 12; r++) for (let q = 0; q < 16; q++) el('rect', { x: 120 + q * 16, y: 80 + r * 16, width: 14, height: 14, rx: 2, fill: q === 15 ? WARNBG : INFOBG, stroke: q === 15 ? WARN : INFO, 'stroke-width': 1, opacity: op * clamp(u * 3 - r * 0.15) });
      mono(248, 296, 'X: 569 × 30   y: 569', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.0) });
      sub(248, 322, 'load_breast_cancer(return_X_y=True)', fade(u, 1.2), { 'font-size': 14, class: 'mono' });
      card(680, 170, 260, 56, { text: 'GradientBoostingClassifier', fs: 15, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 1.4) });
      sub(680, 226, '데이터도 모델도 하나 — 바꿀 것은 random_state 뿐', fade(u, 1.9), { 'font-size': 14.5 }); return; }
    tx(30, 50, 'train_test_split(test_size=0.2, random_state=seed)', { 'font-size': 14, class: 'mono', fill: MUT });
    SEEDS.forEach((sd, i) => { const y = 80 + i * 50, te = testIdx(sd), op = k === 1 ? fade(u, 0.2 + i * 0.3) : 1;
      mono(30, y + 18, 'seed=' + sd, { 'font-size': 14.5, 'font-weight': 700, opacity: op });
      for (let j = 0; j < NC; j++) { const isT = te.has(j); el('rect', { x: 120 + j * 19, y, width: 16, height: 26, rx: 3, fill: isT ? WARNBG : INFOBG, stroke: isT ? WARN : INFO, 'stroke-width': 1.5, opacity: op }); }
      const r = rows.find((q) => q.seed === sd); if (!r) return;
      const fresh = !prows.find((q) => q.seed === sd), j = rows.indexOf(r), a = fresh ? 0.4 + (j - prows.length) * 0.5 : 0;
      grow(510, y + 13, AX(r.acc) - 10, y + 13, fresh ? E(u, a, a + 0.5) : 1, GRID, { plain: true, sw: 1.5, dash: '3 4' });
      const accs = SPLIT_ACC, hot = r.acc === Math.max(...accs) ? WARN : r.acc === Math.min(...accs) ? BAD : ACC, s = fresh ? pop(u, a + 0.4) : 1;
      el('circle', { cx: AX(r.acc), cy: y + 13, r: 9 * s, fill: hot });
      mono(AX(r.acc) + (r.acc > 96.8 ? -14 : 14), y + 18, pct(r.acc), { 'font-size': 14.5, 'font-weight': 800, fill: hot, 'text-anchor': r.acc > 96.8 ? 'end' : 'start', opacity: fresh ? fade(u, a + 0.5) : 1 }); });
    // 정확도 축
    const ay = 360; el('line', { x1: AX1.x0, y1: ay, x2: AX1.x1, y2: ay, stroke: MUT, 'stroke-width': 1.8 });
    [90, 92, 94, 96, 98].forEach((v) => { el('line', { x1: AX(v), y1: ay, x2: AX(v), y2: ay + 5, stroke: MUT }); mono(AX(v), ay + 22, String(v), { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); });
    tx(AX1.x0, 72, 'test 정확도 (%)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
    sub(430, 384, '■ test 20%', 1, { fill: WARN, 'text-anchor': 'start' });
    if (rows.length >= 3) { const lo = Math.min(...rows.map((r) => r.acc)), hi = Math.max(...rows.map((r) => r.acc)), pl = c.prev && c.prev.splitTrials.rows.length >= 3 ? c.prev.splitTrials.rows : null;
      const plo = pl ? Math.min(...pl.map((r) => r.acc)) : lo, phi = pl ? Math.max(...pl.map((r) => r.acc)) : lo, h = lerp(phi, hi, E(u, 1.4, 2.2)), by = ay - 22;
      el('path', { d: `M${AX(plo)},${by + 6} V${by} H${AX(h)} V${by + 6}`, fill: 'none', stroke: WARN, 'stroke-width': 2.2, opacity: fade(u, 1.2) });
      mono((AX(lo) + AX(h)) / 2, by - 6, '폭 ' + ((c.beat.splitTrials.spread.match(/폭 ([0-9.]+)%p/) || [])[1] || (h - lo).toFixed(1)) + '%p', { 'font-size': 14.5, 'font-weight': 800, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); }
    if (k === 4) pill(735, 46, '보고하고 싶은 숫자 = 운', WARN, pop(u, 1.6), { fs: 14 });
    if (k === 5) { banner(735, 40, '단일 split 점수 = 실력 + 분할 운', pop(u, 0.3)); }
  }

  // =========================================================
  // 2. K-fold — 모두가 한 번씩 시험관
  // =========================================================
  function foldGrid(x, y, w, h, nf, act, o) { o = o || {}; const fw = w / nf, rh = h / nf;
    for (let r = 0; r < nf; r++) for (let f = 0; f < nf; f++) { const val = f === r, on = r < act;
      el('rect', { x: x + f * fw + 2, y: y + r * rh + 3, width: fw - 4, height: rh - 6, rx: 4, fill: !on ? SOFT : val ? WARNBG : INFOBG, stroke: !on ? GRID : val ? WARN : INFO, 'stroke-width': 1.5 }); }
    return { fw, rh }; }
  function s2(t, c) { const { k, u } = c, fa = c.beat.foldAnim, vr = c.beat.variants.rows;
    if (k <= 1) { const names = [['KFold', '기본'], ['StratifiedKFold', '분류 · 비율 유지'], ['TimeSeriesSplit', '과거 → 미래']];
      names.forEach(([n, s], i) => card(170 + i * 310, 90, 270, 70, { text: n + '\n' + s, fs: 15, stroke: i === 1 ? ACC : INK, fill: i === 1 ? ACCBG : PANEL, s: k === 0 ? pop(u, 0.2 + i * 0.4) : 1, mono: false }));
      mono(480, 30, 'from sklearn.model_selection import cross_val_score, …', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: k === 0 ? fade(u, 0.1) : 1 });
      if (k === 0) sub(480, 160, '데이터 성격에 맞는 분할기를 고른다', fade(u, 1.6), { 'font-size': 15 });
      if (k === 1) { pill(300, 250, 'X, y — Step 1 과 같다', INK, pop(u, 0.2), { fs: 15 }); pill(660, 250, 'GradientBoosting — 같다', INK, pop(u, 0.5), { fs: 15 });
        pill(480, 320, 'train_test_split(...)', OFF, fade(u, 1.0), { mono: true, fs: 15 }); cross(480, 320, 14, pop(u, 1.4));
        sub(480, 370, '바꾸는 것은 평가 방식뿐', fade(u, 1.8), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); }
      return; }
    if (k === 2) { // 비율 유지 5조각
      tx(60, 50, 'StratifiedKFold(n_splits=5, shuffle=True)', { 'font-size': 15, class: 'mono', 'font-weight': 700, opacity: fade(u, 0.1) });
      const x0 = 60, W = 840, p = 0.37; // 악성 비율 (212/569)
      el('rect', { x: x0, y: 80, width: W, height: 40, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 }); el('rect', { x: x0, y: 80, width: W * p, height: 40, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 1.5 });
      tx(x0, 140, '원본: 악성 212 · 양성 357', { 'font-size': 14, fill: MUT });
      for (let f = 0; f < 5; f++) { const s = E(u, 0.6 + f * 0.25, 1.1 + f * 0.25), fx = x0 + f * (W / 5) + 6, fw = W / 5 - 12, y = lerp(80, 200, s);
        el('rect', { x: fx, y, width: fw, height: 70, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5, opacity: s });
        el('rect', { x: fx, y, width: fw, height: 70 * p, rx: 6, fill: BADBG, stroke: BAD, 'stroke-width': 1.5, opacity: s });
        mono(fx + fw / 2, y + 96, 'fold ' + (f + 1), { 'font-size': 14, 'text-anchor': 'middle', opacity: s }); }
      sub(480, 340, 'fold 마다 클래스 비율 = 원본 비율', fade(u, 2.0), { 'font-size': 15, fill: ACC, 'font-weight': 700 }); return; }
    // k3~5
    if (k === 3 || k === 4) { const act = k === 3 ? Math.min(5, Math.floor(seg(u, 0.2, 2.4) * 5.999)) : 5;
      tx(40, 36, 'cross_val_score(model, X, y, cv=cv)', { 'font-size': 14.5, class: 'mono', 'font-weight': 700 });
      const g = foldGrid(110, 50, 340, 300, 5, act); for (let r = 0; r < 5; r++) { mono(100, 50 + r * 60 + 35, 'R' + (r + 1), { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
        if (r < act) mono(470, 50 + r * 60 + 35, fa.scores[r].toFixed(3), { 'font-size': 16, 'font-weight': 800, fill: ACC }); }
      sub(280, 382, '■ 검증 fold — 모든 샘플이 정확히 한 번', 1, { fill: WARN });
      // 오른쪽: 점수 축
      const ax = axes(600, 80, 320, 220, { x: [0.92, 0.99], y: [0, 1], xt: [0.93, 0.95, 0.97, 0.99] });
      fa.scores.slice(0, act).forEach((v, i) => el('circle', { cx: ax.X(v), cy: ax.Y(0.2 + i * 0.15), r: 8, fill: ACC }));
      if (k === 4) { const m = fa.mean, sd = fa.std, op = fade(u, 0.4);
        el('rect', { x: ax.X(m - sd), y: 80, width: ax.X(m + sd) - ax.X(m - sd), height: 220, fill: ACCBG, opacity: 0.6 * op });
        el('line', { x1: ax.X(m), y1: 80, x2: ax.X(m), y2: 300, stroke: ACC, 'stroke-width': 3, opacity: op });
        mono(ax.X(m), 66, m.toFixed(3) + ' ± ' + sd.toFixed(3), { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.8) });
        el('line', { x1: ax.X(0.974), y1: 80, x2: ax.X(0.974), y2: 300, stroke: WARN, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', opacity: fade(u, 1.4) });
        mono(ax.X(0.974), 318 + 22, '단일 split 최고 97.4%', { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: WARN, opacity: fade(u, 1.6) });
        sub(760, 386, '평균 = 실력 추정 · 표준편차 = 신뢰도', fade(u, 2.0), { 'font-size': 14.5 }); }
      else mono(600, 66, 'fold별 점수', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      return; }
    // k5 TimeSeriesSplit
    tx(40, 40, 'TimeSeriesSplit(n_splits=5) — 항상 과거로 학습, 미래로 검증', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.1) });
    const T = (i) => 60 + i * (600 / 569); // 샘플 인덱스 → x (569행, 실측 경계)
    for (let r = 0; r < 5; r++) { const y = 70 + r * 44, s = E(u, 0.3 + r * 0.3, 0.7 + r * 0.3), tr = 99 + r * 94, va = 94;
      el('rect', { x: T(0), y, width: (T(tr) - T(0)) * s, height: 28, rx: 4, fill: INFOBG, stroke: INFO, 'stroke-width': 1.5 });
      if (s > 0.95) el('rect', { x: T(tr) + 2, y, width: T(tr + va) - T(tr) - 2, height: 28, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 1.5 });
      if (r < 2) mono(T(tr + va) + 12, y + 19, `train[0:${tr}] → valid[${tr}:${tr + va}]`, { 'font-size': 13.5, opacity: s }); }
    grow(60, 300, 900, 300, E(u, 0.2, 1.0), MUT); mono(900, 322, '시간', { 'font-size': 14, 'text-anchor': 'end', fill: MUT });
    pill(300, 370, '일반 KFold: 미래로 과거 맞히기 = 누수', BAD, pop(u, 2.0), { fs: 14.5 }); cross(500, 370, 10, pop(u, 2.2));
    vr.slice(-1).forEach(() => pill(760, 370, '점수 뻥튀기 차단', GOOD, pop(u, 2.3), { fs: 14.5 }));
  }

  // =========================================================
  // 3. 파라미터 vs 하이퍼파라미터
  // =========================================================
  function tree(cx, y0, depth, w, s, col) { const lv = Math.min(depth, 5), dh = Math.min(26, 120 / lv);
    for (let d = 0; d < lv; d++) { const n = 2 ** d; for (let i = 0; i < n; i++) { const x = cx + (i - (n - 1) / 2) * (w / n), y = y0 + d * dh;
        if (d < lv - 1) [0, 1].forEach((b) => el('line', { x1: x, y1: y, x2: cx + (2 * i + b - (2 * n - 1) / 2) * (w / (2 * n)), y2: y + dh, stroke: OFF, 'stroke-width': 1.5, opacity: s }));
        el('circle', { cx: x, cy: y, r: Math.max(2.5, 6 - d), fill: d === lv - 1 ? col : PANEL, stroke: col, 'stroke-width': 1.5, opacity: s }); } }
    if (depth > 5) mono(cx, y0 + lv * dh + 6, '⋮ (depth ' + depth + ')', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: s }); }
  function knob(cx, cy, frac, label, val, op, col) { el('circle', { cx, cy, r: 22, fill: PANEL, stroke: col || INK, 'stroke-width': 2.5, opacity: op });
    const a = Math.PI * (0.75 + 1.5 * frac); el('line', { x1: cx, y1: cy, x2: cx + 17 * Math.cos(a), y2: cy + 17 * Math.sin(a), stroke: col || INK, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: op });
    mono(cx, cy + 42, label, { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT, opacity: op }); if (val != null) mono(cx, cy + 60, val, { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col || INK, opacity: op }); }
  const CFG = [[2, 0.30, 50, 0.960, 0.012], [4, 0.10, 200, 0.974, 0.015], [9, 0.50, 500, 0.972, 0.014]];  // 실측: xgboost 3.4 · sklearn 1.9 · cv=5
  const SPLIT_ACC = [96.5, 97.4, 91.2, 95.6, 95.6];
  function s3(t, c) { const { k, u } = c;
    if (k <= 1) { zone(30, 30, 430, 360, '파라미터 — fit() 이 데이터에서 찾는다', { stroke: INFO, fill: PANEL, color: INFO });
      zone(500, 30, 430, 360, '하이퍼파라미터 — fit() 전에 사람이 정한다', { stroke: WARN, fill: PANEL, color: WARN });
      // 왼쪽: 학습된 트리 분기
      const learned = k === 1 ? E(u, 0.6, 1.8) : 0;
      card(245, 100, 150, 36, { text: learned > 0.3 ? '분기 학습됨' : '분기 조건 ?', fs: 14, mono: true, stroke: INFO, op: fade(u, 0.2) + (k ? 1 : 0) });
      [[150, 180], [340, 180]].forEach(([x, y], i) => { card(x, y, 130, 34, { text: learned > 0.5 + i * 0.2 ? '분기 학습됨' : '분기 ?', fs: 13.5, stroke: INFO, color: learned > 0.5 + i * 0.2 ? INFO : MUT, op: k ? 1 : fade(u, 0.4) }); grow(245, 118, x, y - 17, k ? 1 : E(u, 0.4, 0.8), INFO, { plain: true }); });
      [90, 200, 290, 400].forEach((x, i) => { card(x, 262, 80, 30, { text: learned > 0.7 + i * 0.1 ? '리프 값' : '?', fs: 13.5, stroke: GRID, color: learned > 0.7 + i * 0.1 ? GOOD : MUT, op: k ? 1 : fade(u, 0.6) }); });
      if (k === 1) { pill(245, 330, 'model.fit(X, y) 가 채운다', INFO, pop(u, 0.3), { mono: false, fs: 14.5 }); sub(245, 370, '회귀라면 가중치 w · 절편 b', fade(u, 2.0), { 'font-size': 14.5 }); }
      // 오른쪽: 손잡이 3개
      [['max_depth', 0.4], ['learning_rate', 0.3], ['n_estimators', 0.5]].forEach(([n, f], i) => knob(590 + i * 125, 140, f, n, null, fade(u, 0.8 + i * 0.3), WARN));
      sub(715, 260, '모델이 스스로 못 정한다', fade(u, 1.6), { 'font-size': 15, fill: INK });
      sub(715, 290, 'train 만 보면 늘 과적합 쪽 끝이 뽑힌다', fade(u, 1.9), { 'font-size': 14.5 });
      pill(715, 340, '심판은 CV 점수', ACC, pop(u, 2.2), { fs: 15 }); return; }
    // k2~5: 설정 3개
    CFG.forEach(([d, lr, n, m, sd], i) => { const cx = 160 + i * 320, op = k === 2 ? fade(u, 0.2 + i * 0.4) : 1, win = k >= 4 && i === 1, worst = k >= 4 && i === 2;
      el('rect', { x: cx - 140, y: 24, width: 280, height: 238, rx: 12, fill: win ? ACCBG : PANEL, stroke: win ? ACC : worst ? WARN : GRID, 'stroke-width': win || worst ? 2.5 : 1.5, opacity: op });
      mono(cx, 48, `depth=${d} · lr=${lr.toFixed(2)} · n=${n}`, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: op });
      tree(cx, 70, d, 200, op, win ? ACC : worst ? WARN : INFO);
      if (k >= 3) { const cv = k === 3 ? Math.min(5, Math.floor(seg(u, 0.3 + i * 0.5, 1.3 + i * 0.5) * 5.999)) : 5;
        for (let f = 0; f < 5; f++) el('rect', { x: cx - 95 + f * 38, y: 214, width: 34, height: 20, rx: 3, fill: f < cv ? (f === cv - 1 && k === 3 ? WARNBG : INFOBG) : SOFT, stroke: f < cv ? INFO : GRID });
        mono(cx, 252, '5-fold CV', { 'font-size': 13.5, 'text-anchor': 'middle', fill: MUT }); } });
    if (k === 3) { pill(480, 300, 'train 점수', OFF, fade(u, 1.8), { fs: 15 }); cross(540, 300, 10, pop(u, 2.1)); sub(480, 340, 'train 점수로 고르면 언제나 가장 복잡한 설정이 이긴다', fade(u, 2.2), { 'font-size': 14.5 }); }
    if (k === 4) { const ax = axes(110, 300, 600, 70, { x: [0.94, 0.99], y: [0, 1], xt: [0.94, 0.95, 0.96, 0.97, 0.98, 0.99] });
      CFG.forEach(([d, lr, n, m, sd], i) => { const y = ax.Y(0.8 - i * 0.3), s = E(u, 0.3 + i * 0.4, 0.9 + i * 0.4), col = i === 1 ? ACC : i === 2 ? WARN : INFO;
        el('line', { x1: ax.X(m - sd), y1: y, x2: ax.X(m + sd), y2: y, stroke: col, 'stroke-width': 2.5, opacity: s });
        el('circle', { cx: ax.X(m), cy: y, r: 7, fill: col, opacity: s });
        mono(728, y + 5, `depth ${d}: ${m.toFixed(3)} ± ${sd.toFixed(3)}`, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: s }); });
      pill(480, 278, '차이는 표준편차 안 — 깊이 9 는 이득 없음', WARN, pop(u, 2.0), { fs: 14 }); }
    if (k === 5) { const rows = c.beat.hyperTable.rows;
      rows.forEach((r, i) => { const y = 290 + i * 40, op = fade(u, 0.2 + i * 0.4);
        mono(40, y + 5, r.name, { 'font-size': 14.5, 'font-weight': 800, opacity: op }); tx(190, y + 5, '↓ ' + r.low, { 'font-size': 13.5, fill: INFO, opacity: op }); tx(500, y + 5, '↑ ' + r.high, { 'font-size': 13.5, fill: BAD, opacity: op }); });
      pill(820, 300, '4 × 6 × 5 = 120 조합', WARN, pop(u, 1.8), { fs: 14.5 }); sub(820, 336, '손으로는 못 돈다', fade(u, 2.1), { 'font-size': 14.5, fill: WARN }); }
  }

  // =========================================================
  // 4. 탐색 전략 — Grid · Random · Optuna
  // =========================================================
  const PAN = [{ x: 30, name: 'Grid', col: INFO }, { x: 345, name: 'Random', col: WARN }, { x: 660, name: 'Optuna', col: ACC }], PW = 230, PY = 64;
  const SC = (v) => clamp((v - 0.6) / 0.31); // 점수 → 진하기
  function panel(i, pts, prog, o) { o = o || {}; const p = PAN[i], X = (v) => p.x + 30 + PW * v / 100, Y = (v) => PY + PW - PW * v / 100;
    el('rect', { x: p.x + 30, y: PY, width: PW, height: PW, rx: 6, fill: PANEL, stroke: GRID, 'stroke-width': 1.5 });
    lbl(p.x + 30 + PW / 2, PY - 12, o.title || p.name, 1, { fill: p.col });
    tx(p.x + 30, PY + PW + 18, '중요한 축 →', { 'font-size': 13.5, fill: MUT });
    // 최적 지대 ★
    el('circle', { cx: X(72), cy: Y(30), r: 30, fill: GOODBG, opacity: 0.8 }); tx(X(72), Y(30) + 7, '★', { 'font-size': 20, 'text-anchor': 'middle', fill: GOOD });
    pts.forEach((q, j) => { const s = clamp(prog * pts.length - j); if (s <= 0) return; const scored = o.scored;
      el('circle', { cx: X(q.x), cy: Y(q.y), r: 6 * (0.5 + 0.5 * s), fill: scored ? p.col : PANEL, stroke: p.col, 'stroke-width': 2, opacity: scored ? 0.25 + 0.75 * SC(q.score) : 1 }); });
    if (o.proj) { const xs = [...new Set(pts.map((q) => q.x))]; xs.forEach((v) => el('line', { x1: X(v), y1: PY + PW - 10, x2: X(v), y2: PY + PW, stroke: p.col, 'stroke-width': 3, opacity: o.proj }));
      tx(p.x + 30 + PW, PY + PW + 18, '시도한 값 ' + xs.length + '개', { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', fill: p.col, opacity: o.proj }); }
    return { X, Y }; }
  function s4(t, c) { const { k, u } = c, panels = c.beat.searchViz.panels, P = (n) => panels.find((q) => q.name === n);
    if (k === 0) { [0, 1, 2].forEach((i) => { const op = fade(u, 0.2 + i * 0.3); el('rect', { x: PAN[i].x + 30, y: PY, width: PW, height: PW, rx: 6, fill: SOFT, stroke: GRID, opacity: op }); lbl(PAN[i].x + 30 + PW / 2, PY - 12, PAN[i].name, op, { fill: PAN[i].col }); });
      card(480, 340, 360, 44, { text: 'XGBClassifier — 모델은 하나로 고정', fs: 15, stroke: INK, s: pop(u, 1.2) });
      sub(480, 390, 'GridSearchCV · RandomizedSearchCV · loguniform · randint', fade(u, 1.6), { 'font-size': 14 }); return; }
    const g = P('Grid'), r = P('Random'), op = P('Optuna') || (k === 5 ? null : null);
    panel(0, g.points, k === 1 ? E(u, 0.3, 1.8) : 1, { title: 'Grid (2축 단면)', scored: k >= 2, proj: k === 5 ? fade(u, 1.6) : 0 });
    if (k === 1) { pill(175, 352, '4 × 3 × 2 = 24 조합', INFO, pop(u, 1.6), { fs: 14.5 }); sub(175, 390, '격자 사이 값은 후보에서 제외', fade(u, 2.0), { 'font-size': 14 }); }
    if (k >= 2) { pill(175, 352, 'best ' + g.best.toFixed(3), INFO, k === 2 ? pop(u, 1.4) : 1, { fs: 15, mono: true }); if (k === 2) sub(175, 392, '24 × 5-fold = 120회 학습', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); }
    if (r) { panel(1, r.points, k === 3 ? E(u, 0.8, 2.2) : 1, { scored: k >= 4, proj: k === 5 ? fade(u, 1.6) : 0 });
      if (k === 3) { mono(490, 352, 'loguniform(0.01, 0.5)', { 'font-size': 14.5, 'text-anchor': 'middle', 'font-weight': 700, fill: WARN, opacity: fade(u, 0.3) }); sub(490, 390, '값 목록 대신 분포 — lr 은 로그 스케일', fade(u, 0.7), { 'font-size': 14 }); }
      if (k >= 4) { pill(490, 352, 'best ' + r.best.toFixed(3), WARN, k === 4 ? pop(u, 1.4) : 1, { fs: 15, mono: true }); if (k === 4) sub(490, 392, '16 × 5-fold = 80회 학습', fade(u, 1.8), { 'font-size': 14.5, fill: INK }); } }
    else if (k >= 1) { el('rect', { x: PAN[1].x + 30, y: PY, width: PW, height: PW, rx: 6, fill: SOFT, stroke: GRID }); lbl(PAN[1].x + 30 + PW / 2, PY - 12, 'Random', 1, { fill: WARN }); }
    if (op) { const pp = E(u, 0.3, 1.8), pr = panel(2, op.points, pp, { scored: true });
      // 이력을 보고 다가가는 경로
      const vis = op.points.slice(0, Math.max(1, Math.ceil(pp * op.points.length))); el('polyline', { points: vis.map((q) => pr.X(q.x) + ',' + pr.Y(q.y)).join(' '), fill: 'none', stroke: ACC, 'stroke-width': 1.2, 'stroke-dasharray': '3 3', opacity: 0.7 });
      pill(805, 352, 'best ' + op.best.toFixed(3) + ' · 12회', ACC, pop(u, 2.0), { fs: 15, mono: true }); sub(805, 392, '이전 결과를 보고 다음 후보', fade(u, 2.2), { 'font-size': 14 }); }
    else { el('rect', { x: PAN[2].x + 30, y: PY, width: PW, height: PW, rx: 6, fill: SOFT, stroke: GRID }); lbl(PAN[2].x + 30 + PW / 2, PY - 12, 'Optuna', 1, { fill: ACC }); }
  }

  // =========================================================
  // 5. 실무 프로토콜 — 금고는 한 번만
  // =========================================================
  // 실측 50 trials (TPESampler(seed=0), X_work 5-fold CV)
  const TRIALS = [0.967, 0.976, 0.969, 0.967, 0.974, 0.967, 0.974, 0.967, 0.963, 0.963, 0.969, 0.967, 0.976, 0.967, 0.974, 0.978, 0.978, 0.971, 0.971, 0.969, 0.971, 0.978, 0.978, 0.971, 0.976, 0.971, 0.974, 0.967, 0.971, 0.976, 0.976, 0.971, 0.978, 0.967, 0.974, 0.976, 0.978, 0.976, 0.976, 0.978, 0.976, 0.971, 0.965, 0.974, 0.976, 0.967, 0.967, 0.976, 0.978, 0.976];
  const BX = 40, BW = 880;
  function slider(x, y, w, label, lo, hi, log, op, col) { el('line', { x1: x, y1: y, x2: x + w, y2: y, stroke: col || ACC, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: op });
    if (log) for (let i = 0; i <= 4; i++) el('line', { x1: x + w * i / 4, y1: y - 7, x2: x + w * i / 4, y2: y + 7, stroke: col || ACC, 'stroke-width': 2, opacity: op });
    mono(x - 12, y + 5, label, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', opacity: op });
    mono(x, y + 24, lo, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op }); mono(x + w, y + 24, hi, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: op });
    if (log) mono(x + w + 14, y + 5, 'log', { 'font-size': 13.5, fill: col || ACC, 'font-weight': 700, opacity: op }); }
  function s5(t, c) { const { k, u } = c, pr = c.beat.priority.rows;
    // 맨 위: 데이터 막대
    const sp = k === 0 ? 0 : k === 1 ? E(u, 0.3, 1.2) : 1, wW = BW * 0.8;
    el('rect', { x: BX, y: 40, width: wW, height: 44, rx: 6, fill: INFOBG, stroke: INFO, 'stroke-width': 2 });
    if (k >= 5) for (let f = 1; f < 5; f++) el('line', { x1: BX + wW * f / 5, y1: 40, x2: BX + wW * f / 5, y2: 84, stroke: INFO, 'stroke-width': 1.5 });
    if (k >= 5) { const cur = k === 5 ? Math.floor(seg(u, 0.3, 2.5) * 4.999) : Math.floor(t * 1.5) % 5; el('rect', { x: BX + wW * cur / 5 + 2, y: 42, width: wW / 5 - 4, height: 40, rx: 4, fill: WARNBG, stroke: WARN, 'stroke-width': 2 }); }
    mono(BX + 14, 68, k >= 1 ? 'X_work · y_work  80%' : 'X, y  (569행)', { 'font-size': 15, 'font-weight': 700 });
    const tx0 = BX + wW + 30 * sp, tY = 40 + 0;
    el('rect', { x: tx0, y: tY, width: BW * 0.2 - 10, height: 44, rx: 6, fill: k >= 1 ? BADBG : INFOBG, stroke: k >= 1 ? BAD : INFO, 'stroke-width': 2 });
    mono(tx0 + 12, 68, k >= 1 ? 'test 20%' : '', { 'font-size': 15, 'font-weight': 700, fill: BAD });
    if (k >= 1 && k < 7) lock(tx0 + BW * 0.2 - 30, 62, true, BAD, k === 1 ? pop(u, 1.2) : 1);
    if (k === 1) sub(480, 120, 'train_test_split(test_size=0.2, stratify=y) — 맨 먼저 격리', fade(u, 1.4), { 'font-size': 14.5 });
    if (k === 0) { card(480, 190, 220, 50, { text: 'import optuna', fs: 16, mono: true, stroke: ACC, fill: ACCBG, color: ACC, s: pop(u, 0.4) }); sub(480, 250, '아직 데이터는 나뉘지 않았다', fade(u, 1.2), { 'font-size': 15 }); }
    if (k === 2) { const items = [['trial', 160], ['후보 제안', 340], ['CV 점수', 540], ['return float', 740]];
      items.forEach(([s, x], i) => { pill(x, 170, s, i === 3 ? GOOD : ACC, pop(u, 0.2 + i * 0.35), { fs: 15, mono: i !== 1 && i !== 2 }); if (i) grow(items[i - 1][1] + 58, 170, x - 62, 170, E(u, 0.3 + i * 0.35, 0.5 + i * 0.35), ACC); });
      el('path', { d: 'M740,192 C740,260 160,260 160,192', fill: 'none', stroke: WARN, 'stroke-width': 2.2, 'stroke-dasharray': '6 5', opacity: fade(u, 1.8), 'marker-end': 'url(#ra-ah)' });
      tx(450, 280, 'TPE: (후보, 점수) 이력을 보고 다음 후보를 고른다', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }
    if (k === 3 || k === 4) { const op = (i) => (k === 3 ? fade(u, 0.3 + i * 0.5) : 1);
      slider(260, 150, 420, 'max_depth', '2', '10', false, op(0)); slider(260, 210, 420, 'learning_rate', '0.01', '0.5', true, op(1)); slider(260, 270, 420, 'n_estimators', '50', '500', false, op(2));
      if (k === 3) { el('circle', { cx: 260 + 420 * Math.log(0.05 / 0.01) / Math.log(50), cy: 210, r: 8, fill: WARN, opacity: fade(u, 1.8) }); sub(470, 312, 'log=True — 작은 lr 도 고르게 뽑힌다', fade(u, 1.9), { 'font-size': 14.5 }); }
      if (k === 4) { slider(260, 330, 420, 'reg_lambda', '1e-3', '10', true, fade(u, 0.3), WARN); pill(820, 330, '= Ridge/Lasso 의 α', WARN, pop(u, 1.2), { fs: 14.5 }); } }
    if (k === 5) { mono(BX + wW / 2, 130, 'cross_val_score(model, X_work, y_work, cv=5)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.2) });
      grow(BX + wW + 70, 100, BX + wW + 70, 160, E(u, 1.0, 1.4), BAD); cross(BX + wW + 70, 120, 12, pop(u, 1.6));
      sub(480, 200, 'CV 는 work 안에서만 — test 정보 유입 경로 차단', fade(u, 1.8), { 'font-size': 15, fill: GOOD, 'font-weight': 700 }); }
    if (k === 6 || k === 7) { // 시도 이력
      const ax = axes(110, 130, 360, 150, { x: [0, 50], y: [0.96, 0.98], xt: [0, 25, 50], yt: [0.96, 0.97, 0.98] }), n = k === 6 ? Math.round(lerp(1, 50, E(u, 0.2, 2.2))) : 50;
      tx(110, 118, 'study.optimize(n_trials=50)', { 'font-size': 14, class: 'mono', 'font-weight': 700 });
      let best = 0; const bl = []; for (let i = 0; i < n; i++) { const vv = TRIALS[i]; best = Math.max(best, vv); bl.push([i + 1, best]);
        el('circle', { cx: ax.X(i + 1), cy: ax.Y(vv), r: 3.5, fill: ACC, opacity: 0.55 }); }
      line(ax, bl, 1, ACC, { sw: 2.5 });
      if (n >= 16) mono(ax.X(16) + 6, ax.Y(0.978) - 10, 'best CV 0.978 (16번째)', { 'font-size': 14.5, 'font-weight': 800, fill: ACC }); }
    if (k === 7) { const op = fade(u, 0.3); lock(BX + wW + 140, 62, false, BAD, 1);
      grow(BX + wW + 90, 92, 690, 150, E(u, 0.3, 0.9), BAD); card(720, 180, 230, 56, { text: 'test (1회) = 0.956', fs: 17, mono: true, stroke: BAD, fill: BADBG, color: BAD, s: pop(u, 0.9) });
      sub(720, 230, '여러 번 열면 Step 1 의 시드 고르기', fade(u, 1.4), { 'font-size': 14 }); }
    // 아래: 우선순위
    if (pr.length) { tx(500, 288, '성능 개선 우선순위', { 'font-size': 13.5, 'font-weight': 700, fill: MUT });
      const G = (v) => 680 + v * 20; [0, 5, 10].forEach((v) => mono(G(v), 412, '+' + v + '%p', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
      pr.forEach((r, i) => { const y = 300 + i * 26, [a, b] = r.gain.replace(/[+%p]/g, '').split('~').map(Number), prev = c.prev && c.prev.priority.rows.find((q) => q.rank === r.rank), op = prev ? 1 : fade(u, 1.2 + i * 0.25);
        tx(500, y + 15, r.rank + '. ' + r.what, { 'font-size': 13.5, 'font-weight': r.rank === '4' ? 400 : 700, opacity: op });
        el('rect', { x: G(a), y: y + 3, width: (G(b) - G(a)) * (prev ? 1 : E(u, 1.2 + i * 0.25, 1.8 + i * 0.25)), height: 16, rx: 8, fill: r.rank === '4' ? OFF : GOOD, opacity: op * 0.85 });
        mono(G(b) + 6, y + 16, r.gain, { 'font-size': 13.5, 'font-weight': 700, fill: r.rank === '4' ? MUT : GOOD, opacity: op }); }); }
  }

  RA.page({ title: '평가 실험실 — 분할 · fold · 탐색', scenes: [s1, s2, s3, s4, s5] });
})();
