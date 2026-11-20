/* II-2-2 앙상블 (RF · 부스팅 · XGBoost) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 그림 은유: 배깅 = 나란히 선 숲의 투표, 부스팅 = 정답을 향해 한 칸씩 오르는 계단.
 * 숫자는 STEPS 데이터(treePair, forest, boost, xgb, duel)와 코드 주석에서만 읽는다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, bump, tw, tween, card, mono, sub, lbl, pill, grow, fly, dot, cross, check, lock, clock } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const hash = (a, b, c) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
  function note(x, y, s, op, a) { return tx(x, y, s, Object.assign({ 'font-size': 16, 'font-weight': 700, opacity: op }, a || {})); }
  // 작은 나무 아이콘
  function treeIcon(cx, cy, s, col, op) { if (s <= 0.02) return; const g = R.G(cx, cy, s, op ?? 1);
    el('line', { x1: 0, y1: 6, x2: 0, y2: 16, stroke: MUT, 'stroke-width': 3 }, g);
    el('path', { d: 'M0,-16 L13,8 L-13,8 Z', fill: col || GOOD, opacity: 0.9 }, g); }
  // 결정 트리 모양: levels 단, u(0→1) 만큼 위에서부터 자란다. o.col(L) 로 단마다 색
  function btree(cx, y0, levels, w, u, o) { o = o || {}; const shown = levels * clamp(u), lh = o.lh || 34; let prev = [[cx, y0]];
    for (let L = 1; L < levels; L++) { const n = 2 ** Math.min(L, 6), cur = [];
      for (let i = 0; i < n; i++) { const par = prev[Math.floor(i / 2) % prev.length]; if (!par) continue; if (L > 1 && hash(o.seed || 1, L, i) < 0.32) continue;
        const x = cx - w / 2 + (i + 0.5) * w / n, y = y0 + L * lh, f = clamp(shown - L); if (f <= 0) continue;
        const col = o.col ? o.col(L) : MUT;
        el('line', { x1: par[0], y1: par[1], x2: lerp(par[0], x, f), y2: lerp(par[1], y, f), stroke: col, 'stroke-width': 1.6 });
        if (f > 0.9) el('circle', { cx: x, cy: y, r: L === levels - 1 ? 3.5 : 4.5, fill: L === levels - 1 ? (hash(o.seed || 1, 9, i) > 0.5 ? BAD : GOOD) : col }); cur.push([x, y]); }
      prev = cur.length ? cur : prev; } }
  // 데이터 줄: n 칸, fill(i) → 색 / null(빈칸)
  function strip(x, y, n, cw, ch, fill, op) { for (let i = 0; i < n; i++) { const f = fill(i); el('rect', { x: x + i * cw, y, width: cw - 2, height: ch, rx: 2, fill: f || PANEL, stroke: f ? 'none' : OFF, 'stroke-width': 1.2, 'stroke-dasharray': f ? null : '3 2', opacity: op ?? 1 }); } }

  // ---------- 1. 단일 트리의 흔들림 ----------
  function s1(t, c) { const { k, u } = c, tp = c.beat.treePair || {}, A = tp.treeA || {}, B = tp.treeB || {};
    if (k === 0) { const g = E(u, 0.9, 1.6);
      strip(60, 130, 50, 16.8, 34, (i) => (i < 40 ? (g > 0 ? ACC : INK) : (g > 0 ? WARN : INK)), fade(u, 0.2));
      mono(60, 112, 'load_card_default() → 10,000건', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.3) });
      if (g > 0) { el('line', { x1: 60 + 40 * 16.8 - 1, y1: 120, x2: 60 + 40 * 16.8 - 1, y2: 176, stroke: INK, 'stroke-width': 3, opacity: g });
        mono(60 + 20 * 16.8, 200, 'X_tr (8)', { 'font-size': 16, 'font-weight': 700, fill: ACC, 'text-anchor': 'middle', opacity: g });
        mono(60 + 45 * 16.8, 200, 'X_te (2)', { 'font-size': 16, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: g }); }
      sub(480, 236, 'stratify=y 로 연체 비율을 유지하며 8 : 2', fade(u, 1.6), { 'font-size': 15 });
      treeIcon(420, 320, 1.2, OFF, fade(u, 2.0)); note(450, 326, '아직 트리는 0그루', fade(u, 2.1), { fill: MUT }); return; }
    if (k === 1) { strip(60, 70, 40, 21, 26, () => ACC, 1); mono(60, 56, 'X_tr', { 'font-size': 15, 'font-weight': 700, fill: ACC });
      const holes = [[7, 31], [19, 36]];
      [0, 1].forEach((sd) => { const y = 150 + sd * 90, at = 0.4 + sd * 0.6, g = E(u, at, at + 0.5);
        strip(60, y, 40, 21, 26, (i) => (holes[sd].includes(i) && g > 0.5 ? null : sd ? INFO : WARN), g);
        mono(60, y - 12, `seed=${sd}  95% 비복원 추출`, { 'font-size': 15, 'font-weight': 700, fill: sd ? INFO : WARN, opacity: g }); });
      holes.forEach((hs, sd) => hs.forEach((i) => { const x = 60 + i * 21 + 9; el('line', { x1: x, y1: 96, x2: x, y2: 146 + sd * 90, stroke: BAD, 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: fade(u, 1.7) }); }));
      note(60, 340, '두 표본은 빠진 칸만 조금 다르다', fade(u, 2.0));
      sub(700, 375, '실무의 "다음 달 재학습" 과 같은 상황', fade(u, 2.3), { 'font-size': 15 }); return; }
    // 트리 두 그루
    const grow2 = k === 2 ? E(u, 0.4, 2.0) : 1, rootSwap = k >= 4;
    [[A, 250, 1, WARN, 'seed=0'], [B, 710, 7, INFO, 'seed=1']].forEach(([T, cx, seed, col, nm], i) => {
      const lv = Math.min(8, Math.round((T.depth || 6) * 0.65)), cc = (L) => (k >= 4 && L <= Math.floor(E(u, 0.6, 2.0) * lv) ? (i ? INFO : WARN) : MUT);
      if (k <= 4) btree(cx, 120, lv, 380, grow2, { seed, col: cc, lh: 30 });
      const rs = k === 3 ? 1 + bump(u, 0.4 + i * 0.4) : 1, txt = k >= 3 ? (T.root || '').replace('root: ', '') : '루트 분기';
      card(cx, 96, 230, 40, { rx: 8, stroke: k >= 3 ? col : INK, color: k >= 3 ? col : INK, text: txt, fs: 15, s: rs, sw: k >= 3 ? 2.6 : 2 });
      mono(cx, 60, nm, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', fill: MUT });
      if (k <= 4) mono(cx, 395, `깊이 ${T.depth} · 잎 ${T.leaves}`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: k === 2 ? fade(u, 1.8) : 1 }); });
    if (k === 3) { el('rect', { x: 330, y: 160, width: 300, height: 62, rx: 8, fill: PANEL, stroke: GRID, 'stroke-width': 1.5, opacity: fade(u, 1.3) });
      mono(480, 180, 'seed=0 root: monthly_usage', { 'font-size': 15, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: fade(u, 1.4) });
      mono(480, 206, 'seed=1 root: overdue_count', { 'font-size': 15, 'font-weight': 700, fill: INFO, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }
    if (k === 4) { mono(480, 104, '↔', { 'font-size': 26, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      card(480, 360, 400, 38, { rx: 19, fill: INK, stroke: 'none', text: '근소한 이득 차이 → 아래 전체가 연쇄적으로 바뀐다', fs: 14.5, color: PANEL, s: pop(u, 2.1) }); }
    if (k === 2) sub(480, 60, '같은 설정, 데이터만 5% 차이', fade(u, 0.3), { 'font-size': 15 });
    if (k === 5) { const cs = tp.customers || [];
      [['고객', 60], ['seed=0', 520], ['seed=1', 620]].forEach(([h, x]) => mono(x, 160, h, { 'font-size': 14, 'font-weight': 700, fill: MUT }));
      cs.forEach((cu, i) => { const y = 192 + i * 34, op = fade(u, 0.3 + i * 0.15), fl = cu.flip && u > 1.3;
        if (fl) el('rect', { x: 52, y: y - 22, width: 690, height: 30, rx: 6, fill: BADBG, opacity: fade(u, 1.3) });
        tx(60, y, cu.name, { 'font-size': 14.5, opacity: op });
        mono(520, y, cu.a, { 'font-size': 15, 'font-weight': 700, fill: cu.a === '연체' ? BAD : GOOD, opacity: op }); mono(620, y, cu.b, { 'font-size': 15, 'font-weight': 700, fill: cu.b === '연체' ? BAD : GOOD, opacity: op });
        if (cu.flip) mono(712, y, '↺', { 'font-size': 18, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.3) }); });
      mono(800, 260, '≈ 12%', { 'font-size': 34, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.9) });
      sub(800, 290, 'flip_rate (테스트셋 전체)', fade(u, 2.0), { 'font-size': 14.5 }); }
    if (k === 6) { const ax = R.axes(80, 220, 640, 10, { x: [0, 1], y: [0, 1], xt: [0, 0.5, 1] }); tx(80, 140, '같은 고객 #1024 — 재학습할 때마다 나온 연체 확률', { 'font-size': 15, 'font-weight': 700 });
      for (let i = 0; i < 24; i++) { const v = 0.15 + 0.7 * hash(3, i, 1), s = pop(u, 0.3 + i * 0.05); if (s > 0) el('circle', { cx: ax.X(v), cy: 222 - 14 - (i % 4) * 11, r: 6 * s, fill: WARN, opacity: 0.8 }); }
      note(80, 290, '진단: 고분산 — 데이터의 우연까지 외운다', fade(u, 1.5), { fill: BAD });
      const g = E(u, 2.0, 2.6); el('rect', { x: ax.X(0.5 - 0.06), y: 320, width: ax.X(0.56) - ax.X(0.44), height: 26, rx: 13, fill: GOODBG, stroke: GOOD, 'stroke-width': 2, opacity: g });
      note(ax.X(0.62), 339, '여러 그루를 평균하면 좁아지지 않을까?', g, { fill: GOOD }); } }

  // ---------- 2. 배깅과 랜덤 포레스트 ----------
  function gauge(x, y, rows, prow, u, w) { w = w || 520;
    rows.forEach((r, i) => { const yy = y + i * 62, old = (prow || []).find((p) => p.name === r.name), op = old ? 1 : fade(u, 0.3), col = r.tone === 'bad' ? BAD : r.tone === 'good' ? GOOD : WARN;
      tx(x, yy, r.name, { 'font-size': 15, 'font-weight': 700, opacity: op });
      const half = (w / 2) * (r.spread / 100) * (old ? 1 : E(u, 0.4, 1.2)), cx = x + 250 + w / 2;
      el('line', { x1: x + 250, y1: yy + 22, x2: x + 250 + w, y2: yy + 22, stroke: GRID, 'stroke-width': 2, opacity: op });
      el('rect', { x: cx - half, y: yy + 12, width: 2 * half, height: 20, rx: 10, fill: col, opacity: 0.3 * op }); el('line', { x1: cx, y1: yy + 8, x2: cx, y2: yy + 36, stroke: INK, 'stroke-width': 2, opacity: op });
      mono(x + 250 + w + 12, yy + 28, r.sd, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: op }); }); }
  function s2(t, c) { const { k, u } = c, F = c.beat.forest || {}, PF = (c.prev && c.prev.forest) || {}, V = (F.variance || {}).rows || [], PV = (PF.variance || {}).rows || [];
    if (k === 0) { mono(480, 90, 'Var( 평균 ) = σ² / n', { 'font-size': 26, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 0.3) });
      sub(480, 124, '독립인 추정치 n 개를 평균하면', fade(u, 0.6), { 'font-size': 15 });
      gauge(40, 180, V, PV, u, 440);
      tx(40, 262, '트리 10그루 평균', { 'font-size': 15, fill: OFF, opacity: fade(u, 1.4) }); tx(40, 324, '트리 100그루 평균', { 'font-size': 15, fill: OFF, opacity: fade(u, 1.6) });
      mono(510, 286, '?', { 'font-size': 22, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); mono(510, 348, '?', { 'font-size': 22, 'font-weight': 800, fill: OFF, 'text-anchor': 'middle', opacity: fade(u, 1.7) });
      note(40, 400, '단, "독립" 일 때 — 트리끼리 덜 닮게 만드는 게 관건', fade(u, 2.2)); return; }
    if (k === 1) { for (let i = 0; i < 100; i++) treeIcon(80 + (i % 20) * 30, 90 + Math.floor(i / 20) * 46, 0.85 * pop(u, 0.2 + i * 0.016), GOOD);
      mono(760, 110, 'n_estimators=100', { 'font-size': 17, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.4) });
      note(60, 350, '트리를 늘려도 과적합하지 않는다 — 평균이 수렴할 뿐', fade(u, 2.0)); return; }
    if (k === 2 || k === 3) { const T = (F.trees || []).slice(0, k === 2 ? 4 : 7);
      T.forEach((tr, i) => { const x = 110 + (i % 4) * 225, y = 110 + Math.floor(i / 4) * 150, at = k === 2 ? 0.3 + i * 0.35 : 0, s = (PF.trees || []).some((p) => p.id === tr.id) ? 1 : pop(u, at + 0.1);
        card(x, y, 200, 120, { rx: 10, stroke: GRID, s });
        if (s < 0.9) return;
        treeIcon(x - 70, y - 30, 1, k === 3 ? (E(u, 0.3, 1.8) > 0.99 ? GOOD : OFF) : GOOD);
        mono(x - 46, y - 28, tr.boot.split(' ')[0], { 'font-size': 16, 'font-weight': 800 });
        for (let j = 0; j < 10; j++) { const d = hash(i, j, 2) < 0.37; el('rect', { x: x - 86 + j * 17, y: y - 4, width: 14, height: 14, rx: 2, fill: d ? PANEL : INFO, stroke: d ? OFF : 'none', 'stroke-dasharray': '2 2', opacity: d ? 1 : 0.4 + 0.6 * hash(i, j, 5) }); }
        tx(x, y + 38, tr.feat, { 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 600, fill: ACC });
        if (k === 3) { el('rect', { x: x - 86, y: y + 48, width: 172, height: 6, rx: 3, fill: SOFT }); el('rect', { x: x - 86, y: y + 48, width: 172 * E(u, 0.3, 1.8), height: 6, rx: 3, fill: GOOD }); } });
      if (k === 2) { mono(110, 396, 'bootstrap=True', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.8) }); sub(380, 392, '트리마다 다른 복원추출', fade(u, 1.9));
        mono(560, 396, 'max_features="sqrt"', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 2.1) }); sub(850, 392, '분기 후보 특성 제한', fade(u, 2.2)); }
      else { mono(785, 270, 'n_jobs=-1', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
        sub(785, 300, '모든 트리가 동시에 자란다', fade(u, 0.6), { 'font-size': 15 });
        pill(785, 350, '100그루 학습 완료', GOOD, pop(u, 2.0), { fs: 15 }); }
      return; }
    if (k === 4) { // 부스트랩 가방: 안쪽 63% / 바깥 37%
      el('ellipse', { cx: 230, cy: 210, rx: 170, ry: 130, fill: ACCBG, stroke: ACC, 'stroke-width': 2.5, opacity: fade(u, 0.2) });
      lbl(230, 70, '부트스트랩 표본 (B₁)', fade(u, 0.2), { fill: ACC });
      for (let i = 0; i < 30; i++) { const out = i % 8 === 2 || i % 8 === 5 || i % 8 === 7, s = pop(u, 0.3 + i * 0.03);
        const x = out ? 450 + (i % 3) * 30 : 130 + (i % 7) * 33, y = out ? 130 + Math.floor(i / 3) * 26 : 140 + Math.floor(i / 7) * 34;
        el('circle', { cx: x, cy: y, r: 7 * s, fill: out ? WARN : INFO, opacity: 0.9 });
        if (!out && i % 5 === 0 && s > 0.9) mono(x + 9, y - 6, '×2', { 'font-size': 13.5, fill: INFO, 'font-weight': 700 }); }
      lbl(480, 110, 'OOB ~37%', fade(u, 1.0), { fill: WARN });
      tx(600, 120, 'oob_score_', { 'font-size': 15, fill: MUT, class: 'mono' }); R.hbar(600, 132, 240, 0.87, 1, { u: E(u, 1.3, 1.9), col: WARN, text: '0.87' });
      tx(600, 220, 'test AUC', { 'font-size': 15, fill: MUT }); R.hbar(600, 232, 240, 0.91, 1, { u: E(u, 1.6, 2.2), col: ACC, text: '0.91' });
      note(600, 320, '안 뽑힌 표본으로 공짜 검증', fade(u, 2.2)); return; }
    if (k === 5 || k === 6) { const IMP = [['overdue_count', 0.31, '연체이력'], ['monthly_usage', 0.24, '이용액'], ['income', 0.17, '소득']];
      mono(60, 80, 'sorted(feature_importances_)[:3]', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      IMP.forEach(([nm, v, kr], i) => { const y = 120 + i * 70, g = k === 5 ? E(u, 0.6 + i * 0.3, 1.4 + i * 0.3) : 1;
        mono(60, y + 22, nm, { 'font-size': 16, 'font-weight': 700 }); sub(160, y + 46, kr, 1, { 'font-size': 14 });
        R.hbar(240, y + 6, 420, v, 0.35, { u: g, col: ACC, label: k === 6, text: v.toFixed(2) }); });
      if (k === 5) note(60, 360, '어떤 특성이 분기에 많이 기여했나 — 심사팀 설명용', fade(u, 2.0));
      else { note(60, 350, '연체이력 > 이용액 > 소득 — 도메인 상식과 맞는다', fade(u, 0.8), { fill: GOOD });
        sub(380, 390, '상관된 특성끼리 중요도를 나눠 갖는다 → 순위를 인과로 읽지 않는다', fade(u, 1.8), { 'font-size': 15 }); }
      return; }
    if (k === 7) { gauge(40, 60, V, PV, u, 420);
      const ta = F.tally || {}; tx(40, 280, '고객 #1024 투표', { 'font-size': 15, 'font-weight': 700 });
      const tot = (ta.spam || 0) + (ta.ham || 0) || 1, g = E(u, 0.6, 1.4);
      el('rect', { x: 200, y: 262, width: 520 * (ta.spam / tot) * g, height: 28, rx: 4, fill: BAD, opacity: 0.85 }); el('rect', { x: 200 + 520 * (ta.spam / tot) * g, y: 262, width: 520 * (ta.ham / tot) * g, height: 28, rx: 4, fill: GOOD, opacity: 0.85 });
      mono(206, 282, ta.spamLabel || '', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, opacity: fade(u, 1.2) }); mono(714, 282, ta.hamLabel || '', { 'font-size': 14.5, 'font-weight': 700, fill: PANEL, 'text-anchor': 'end', opacity: fade(u, 1.2) });
      note(40, 350, '분산 ↓ 는 확인 — 하지만 편향은 그대로', fade(u, 1.8));
      sub(400, 386, '다 같이 틀리는 패턴은 평균으로 못 고친다 → 부스팅', fade(u, 2.2), { 'font-size': 15 }); } }

  // ---------- 3. 부스팅: 잔차 계단 ----------
  const RES = [0.412, 0.255, 0.149, 0.074, 0.029];   // 코드 주석: round 1~5 잔차 크기
  function s3(t, c) { const { k, u } = c, Bo = c.beat.boost || {}, rs = Bo.rounds || [], prs = ((c.prev && c.prev.boost) || {}).rounds || [];
    if (k === 6) { // 배깅 vs 부스팅 구조
      lbl(110, 70, '배깅', 1, { fill: GOOD, 'font-size': 17 }); sub(110, 94, '병렬 · 평균', 1, { 'font-size': 14 });
      for (let i = 0; i < 4; i++) { treeIcon(220 + i * 70, 82, 1.1, GOOD, fade(u, 0.3)); grow(220 + i * 70, 106, 470, 150, E(u, 0.5, 0.9), GOOD, { plain: true }); }
      card(520, 150, 110, 44, { rx: 8, stroke: GOOD, color: GOOD, text: '평균', fs: 16, s: pop(u, 0.9) }); pill(700, 150, '분산 ↓', GOOD, pop(u, 1.1), { fs: 16 });
      lbl(110, 260, '부스팅', 1, { fill: ACC, 'font-size': 17 }); sub(110, 284, '순차 · 누적', 1, { 'font-size': 14 });
      for (let i = 0; i < 4; i++) { const x = 220 + i * 90, at = 1.2 + i * 0.25; treeIcon(x, 300, 1.1, ACC, fade(u, at)); if (i < 3) grow(x + 18, 300, x + 70, 300, E(u, at + 0.1, at + 0.3), ACC); mono(x, 340, `f${i + 1}`, { 'font-size': 14.5, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, at) }); }
      card(600, 300, 110, 44, { rx: 8, stroke: ACC, color: ACC, text: '합', fs: 16, s: pop(u, 2.1) }); pill(760, 300, '편향 ↓', ACC, pop(u, 2.2), { fs: 16 });
      cross(400, 370, 9, pop(u, 2.4)); tx(420, 376, '트리 단위 병렬화 불가', { 'font-size': 15, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.4) }); return; }
    const ax = R.axes(80, 60, 380, 300, { x: [0.4, 5.6], y: [0, 1], xt: [1, 2, 3, 4, 5], yt: [0, 0.5, 1], xl: '라운드', yl: '#1024 연체 확률 예측' });
    const tg = k === 0 ? E(u, 0.2, 0.8) : 1; if (tg > 0) el('line', { x1: ax.X(0.4), y1: ax.Y(0.8), x2: ax.X(lerp(0.4, 5.6, tg)), y2: ax.Y(0.8), stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '8 5' });
    mono(ax.X(0.45), ax.Y(0.8) - 8, '정답 0.80', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: tg });
    if (k === 1) for (let i = 1; i <= 5; i++) el('rect', { x: ax.X(i) - 22, y: ax.Y(1), width: 44, height: ax.h, rx: 4, fill: 'none', stroke: OFF, 'stroke-dasharray': '4 4', opacity: pop(u, 0.3 + i * 0.2) });
    rs.forEach((r, i) => { const old = prs.find((p) => p.r === r.r), at = old ? -1 : 0.3 + (i - prs.length) * 0.8, g = old ? 1 : E(u, at, at + 0.6), base = i ? rs[i - 1].pred : 0, top = lerp(base, r.pred, g), x = ax.X(r.r);
      if (g <= 0) return;
      el('rect', { x: x - 20, y: ax.Y(top), width: 40, height: ax.Y(0) - ax.Y(top), rx: 3, fill: k === 5 ? ACCBG : INFOBG, stroke: INFO, 'stroke-width': 1.5 });
      if (i) el('rect', { x: x - 20, y: ax.Y(top), width: 40, height: ax.Y(base) - ax.Y(top), rx: 3, fill: ACC, opacity: 0.75 });
      if (g > 0.95) { el('line', { x1: x + 26, y1: ax.Y(r.pred), x2: x + 26, y2: ax.Y(0.8), stroke: BAD, 'stroke-width': 3 }); mono(x, ax.Y(r.pred) - 8, r.pred.toFixed(2), { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle' }); } });
    if (k === 0) { const g = E(u, 0.9, 1.5); el('rect', { x: ax.X(1) - 20, y: ax.Y(0.45), width: 40, height: ax.Y(0) - ax.Y(0.45), rx: 3, fill: 'none', stroke: MUT, 'stroke-dasharray': '5 4', opacity: g });
      el('line', { x1: ax.X(1) + 26, y1: ax.Y(0.45), x2: ax.X(1) + 26, y2: ax.Y(0.8), stroke: BAD, 'stroke-width': 3, opacity: fade(u, 1.3) });
      note(520, 110, '잔차 = 정답 − 지금 예측', fade(u, 1.3), { fill: BAD });
      note(520, 160, '다음 트리는 정답이 아니라 이 차이를 배운다', fade(u, 1.8));
      mono(520, 240, 'F(x) = f₁ + η·f₂ + η·f₃ + ⋯', { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2) }); return; }
    if (k === 1) { mono(520, 110, 'eta = 0.3', { 'font-size': 22, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.3) });
      sub(700, 144, '한 번에 잔차의 30% 만큼만 반영', fade(u, 0.6), { 'font-size': 15 });
      el('rect', { x: 520, y: 170, width: 300, height: 18, rx: 4, fill: BADBG }); el('rect', { x: 520, y: 170, width: 90 * E(u, 0.8, 1.3), height: 18, rx: 4, fill: ACC });
      mono(520, 250, 'n_rounds = 5', { 'font-size': 22, 'font-weight': 800, opacity: fade(u, 1.4) });
      note(520, 320, '보폭 × 횟수 = 과적합을 좌우하는 한 쌍', fade(u, 2.1)); return; }
    if (k === 2) { mono(520, 110, 'pred = y_tr.mean()', { 'font-size': 18, 'font-weight': 700, opacity: fade(u, 0.3) });
      note(520, 160, '가장 단순한 예측에서 출발', fade(u, 1.0));
      mono(520, 230, '잔차 100%', { 'font-size': 22, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.5) });
      sub(700, 280, '여기서부터 오차를 깎아 나간다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 3) { const ph = Math.floor(clamp((u - 0.3) / 0.45, 0, 4.99)) % 3;
      ['① residual = y − pred', '② tree.fit(X, residual)', '③ pred += eta · tree'].forEach((s, i) => { const on = u > 0.3 && i === ph;
        card(690, 110 + i * 60, 360, 46, { rx: 8, text: s, fs: 15, mono: true, stroke: on ? ACC : GRID, color: on ? ACC : INK, sw: on ? 2.6 : 1.5 }); });
      rs.slice(1).forEach((r, i) => mono(520, 330 + i * 30, `R${r.r}: ${r.pred.toFixed(2)} · 잔차 ${r.residual}%`, { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.0 + i * 0.8) }));
      return; }
    if (k === 4 || k === 5) { if (k === 4) { const ch = R.axes(560, 90, 330, 220, { x: [1, 5], y: [0, 0.45], xt: [1, 2, 3, 4, 5], yt: [0, 0.2, 0.4], yl: '잔차 크기 (코드 출력)' });
        R.line(ch, RES.map((v, i) => [i + 1, v]), E(u, 0.4, 1.8), BAD, { sw: 3 }); R.scatter(ch, RES.map((v, i) => [i + 1, v, BAD]), { u: E(u, 0.4, 1.8), r: 5 });
        mono(ch.X(1) + 10, ch.Y(0.412) + 4, '0.412', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.5) }); mono(ch.X(5), ch.Y(0.029) - 12, '0.029', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        note(560, 380, '편향이 계단식으로 줄어든다', fade(u, 2.2), { fill: GOOD }); return; }
      // k5: 쌓인 막대로 F(x)
      const x0 = 640, base = R.axes(x0, 60, 1, 300, { x: [0, 1], y: [0, 1] }).Y;
      mono(x0 + 120, 50, 'F(x)', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle' });
      rs.forEach((r, i) => { const lo = i ? rs[i - 1].pred : 0, g = E(u, 0.3 + i * 0.35, 0.6 + i * 0.35); if (g <= 0) return;
        el('rect', { x: x0 + 70, y: base(lerp(lo, r.pred, g)), width: 100, height: base(lo) - base(lerp(lo, r.pred, g)), fill: i ? ACC : INFO, opacity: i ? 0.45 + i * 0.1 : 0.5, stroke: PANEL, 'stroke-width': 1.5 });
        mono(x0 + 182, (base(lo) + base(r.pred)) / 2 + 5, i ? `η·f${i + 1}` : '평균', { 'font-size': 14.5, 'font-weight': 700, opacity: g }); });
      el('line', { x1: x0 + 60, y1: base(0.8), x2: x0 + 260, y2: base(0.8), stroke: GOOD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      mono(x0 + 120, 392, '= 0.77', { 'font-size': 20, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      sub(800, 70, '투표가 아니라 덧셈', fade(u, 2.3), { 'font-size': 15 }); } }

  // ---------- 4. XGBoost ----------
  function tradeChart(rows, prows, u) { const ax = R.axes(580, 80, 340, 230, { x: [0, 2000], y: [0, 1], xt: [0, 1000, 2000], xl: '트리 수', yl: '검증 점수 (개념도)' });
    const PK = { bad: 100, mid: 400, good: 1500 };
    rows.forEach((r, i) => { const pk = PK[r.tone] || 400, old = (prows || []).some((p) => p.lr === r.lr), col = r.tone === 'bad' ? BAD : r.tone === 'good' ? GOOD : WARN, top = 0.62 + i * 0.1;
      const P = []; for (let j = 0; j <= 40; j++) { const n = j * 50; P.push([n, top * (1 - Math.exp(-3 * n / pk)) - 0.3 * top * Math.max(0, n - pk) / 2000]); }
      R.line(ax, P, old ? 1 : E(u, 0.3, 1.5), col, { sw: 2.6 });
      const pv = top * (1 - Math.exp(-3)); el('circle', { cx: ax.X(pk), cy: ax.Y(pv), r: 5, fill: col, opacity: old ? 1 : fade(u, 1.4) });
      tx(600, 372 + i * 20, `● lr ${r.lr.split(' ')[0]} · ${r.trees.split(' ')[0]}`, { 'font-size': 13.5, 'font-weight': 700, fill: col, opacity: old ? 1 : fade(u, 1.5) }); }); }
  function s4(t, c) { const { k, u } = c, X = c.beat.xgb || {}, TR = (X.tradeoff || {}).rows || [], PTR = (((c.prev && c.prev.xgb) || {}).tradeoff || {}).rows || [];
    if (k === 0) { card(260, 110, 300, 56, { rx: 10, stroke: ACC, color: ACC, text: 'XGBClassifier', fs: 18, mono: true, s: pop(u, 0.3) });
      card(660, 110, 300, 56, { rx: 10, stroke: GOOD, color: GOOD, text: 'RandomForestClassifier', fs: 16, mono: true, s: pop(u, 0.6) });
      ['.fit(X, y)', '.predict_proba(X)', '.feature_importances_'].forEach((s, i) => { const y = 200 + i * 50, at = 1.0 + i * 0.3;
        card(260, y, 240, 38, { rx: 6, text: s, fs: 15, mono: true, stroke: GRID, s: pop(u, at) }); card(660, y, 240, 38, { rx: 6, text: s, fs: 15, mono: true, stroke: GRID, s: pop(u, at + 0.1) });
        mono(460, y + 6, '=', { 'font-size': 20, 'font-weight': 800, 'text-anchor': 'middle', fill: MUT, opacity: fade(u, at + 0.2) }); });
      note(260, 390, 'sklearn 과 같은 인터페이스 — 계보는 GBM, 달라진 건 공학', fade(u, 2.2)); return; }
    tradeChart(TR, PTR, u);
    if (k === 1) { [['n_estimators=2000', '상한만 크게', INK], ['learning_rate=0.03', '작은 보폭', ACC], ['max_depth=5', '약한 학습기 유지', INFO]].forEach(([a, b, col], i) => {
        card(240, 110 + i * 90, 380, 64, { rx: 10, stroke: col, s: pop(u, 0.3 + i * 0.4) }); mono(70, 106 + i * 90, a, { 'font-size': 16, 'font-weight': 800, fill: col, opacity: fade(u, 0.4 + i * 0.4) }); tx(70, 130 + i * 90, b, { 'font-size': 14.5, fill: MUT, opacity: fade(u, 0.5 + i * 0.4) }); });
      sub(240, 395, '몇 그루에서 멈출지는 데이터가 정한다', fade(u, 2.0), { 'font-size': 15 }); return; }
    if (k === 2) { for (let r = 0; r < 8; r++) for (let q = 0; q < 10; q++) { const dropR = r === 2 || r === 6, dropC = q === 3 || q === 8, g = E(u, 0.6, 1.2);
        el('rect', { x: 50 + q * 26, y: 80 + r * 24, width: 22, height: 20, rx: 2, fill: (dropR || dropC) && g > 0.5 ? SOFT : INFO, opacity: (dropR || dropC) ? 1 - 0.6 * g : 0.75 }); }
      mono(50, 300, 'subsample=0.8', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.0) }); mono(50, 324, 'colsample_bytree=0.8', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 1.1) });
      // 정규화: 잎 가중치가 줄고 가지 하나가 잘린다
      const sh = E(u, 1.4, 2.2); el('circle', { cx: 430, cy: 90, r: 8, fill: MUT });
      [[380, 160, 1], [480, 160, 0]].forEach(([x, y, keep]) => { el('line', { x1: 430, y1: 98, x2: x, y2: y - 10, stroke: MUT, 'stroke-width': 2, opacity: keep ? 1 : 1 - sh, 'stroke-dasharray': keep ? null : '4 3' }); el('rect', { x: x - 14, y: y - 10, width: 28, height: 70 * (keep ? 1 - 0.45 * sh : 1 - sh) + 4, rx: 3, fill: ACC, opacity: keep ? 0.8 : 0.8 * (1 - sh) }); });
      mono(330, 280, 'reg_lambda · gamma', { 'font-size': 15, 'font-weight': 700, fill: ACC, opacity: fade(u, 1.4) });
      tx(330, 304, '잎 가중치 ↓ · 이득 작은 분기 컷', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.6) });
      note(50, 380, '부스팅에 배깅의 무작위성을 섞었다', fade(u, 2.3)); return; }
    if (k === 3) { const ax = R.axes(60, 90, 440, 220, { x: [0, 400], y: [0, 1], xl: '라운드', yl: '검증 AUC' });
      const P = []; for (let j = 0; j <= 40; j++) { const n = j * 10; P.push([n, 0.8 * (1 - Math.exp(-n / 70)) - (n > 200 ? 0.04 * (n - 200) / 200 : 0)]); }
      R.line(ax, P, E(u, 0.2, 1.4), ACC, { sw: 3 });
      const g = E(u, 1.4, 2.0); el('rect', { x: ax.X(200), y: 90, width: (ax.X(320) - ax.X(200)) * g, height: 220, fill: WARNBG, opacity: 0.8 });
      mono(ax.X(260), 120, '50라운드 정체', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, 'text-anchor': 'middle', opacity: g });
      el('line', { x1: ax.X(320), y1: 90, x2: ax.X(320), y2: 310, stroke: BAD, 'stroke-width': 3, opacity: fade(u, 2.0) }); mono(ax.X(320), 82, '중단', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 2.0) });
      mono(60, 392, 'early_stopping_rounds=50 · eval_metric="auc"', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.4) }); return; }
    if (k === 4) { [['X_tr  학습', ACC, 260], ['X_val', WARN, 90], ['X_te', INFO, 90]].reduce((x, [nm, col, w], i) => { el('rect', { x, y: 110, width: w - 6, height: 44, rx: 6, fill: col, opacity: 0.25 * fade(u, 0.2 + i * 0.3) + 0.0001 }); el('rect', { x, y: 110, width: w - 6, height: 44, rx: 6, fill: 'none', stroke: col, 'stroke-width': 2, opacity: fade(u, 0.2 + i * 0.3) });
        mono(x + (w - 6) / 2, 138, nm, { 'font-size': 15, 'font-weight': 700, fill: col, 'text-anchor': 'middle', opacity: fade(u, 0.2 + i * 0.3) }); return x + w; }, 50);
      card(185, 260, 180, 50, { rx: 10, stroke: ACC, color: ACC, text: 'xgb.fit', fs: 16, mono: true, s: pop(u, 1.0) });
      grow(180, 156, 185, 232, E(u, 1.1, 1.4), ACC); grow(395, 156, 280, 240, E(u, 1.4, 1.8), WARN); mono(400, 210, 'eval_set', { 'font-size': 14.5, 'font-weight': 700, fill: WARN, opacity: fade(u, 1.6) });
      lock(489, 186, true, INFO, pop(u, 2.0)); tx(300, 350, '테스트셋은 마지막 채점용으로 잠가 둔다', { 'font-size': 15, 'font-weight': 700, fill: INFO, opacity: fade(u, 2.1) }); return; }
    if (k === 5) { mono(60, 110, 'best_iteration', { 'font-size': 16, 'font-weight': 700, fill: MUT }); const v = Math.round(812 * E(u, 0.3, 1.3));
      mono(60, 156, String(v), { 'font-size': 36, 'font-weight': 800, fill: ACC }); mono(160, 156, '/ 2000 상한', { 'font-size': 17, fill: MUT });
      el('rect', { x: 60, y: 176, width: 420, height: 12, rx: 6, fill: SOFT }); el('rect', { x: 60, y: 176, width: 420 * 812 / 2000 * E(u, 0.3, 1.3), height: 12, rx: 6, fill: ACC });
      tx(60, 250, 'XGB', { 'font-size': 15, 'font-weight': 700 }); R.hbar(120, 236, 300, 0.93, 1, { u: E(u, 1.4, 2.0), col: ACC, text: 'AUC 0.93' });
      tx(60, 296, 'RF', { 'font-size': 15, 'font-weight': 700 }); R.hbar(120, 282, 300, 0.91, 1, { u: E(u, 1.6, 2.2), col: GOOD, text: 'AUC 0.91' }); return; }
    if (k === 6) { ['RF', 'XGB'].forEach((m, i) => { const y = 110 + i * 110, col = i ? ACC : GOOD; card(110, y, 140, 52, { rx: 10, stroke: col, color: col, text: m, fs: 17, s: pop(u, 0.3 + i * 0.4) }); grow(185, y, 255, 165, E(u, 0.6 + i * 0.4, 0.9 + i * 0.4), col); });
      card(345, 165, 170, 60, { rx: 10, stroke: INK, text: 'feature_\nimportances_', fs: 14, mono: true, s: pop(u, 1.2) });
      sub(345, 220, '같은 리포트 코드', fade(u, 1.6), { 'font-size': 14.5 });
      note(60, 360, '모델을 바꿔도 리포트가 안 깨진다', fade(u, 2.2)); return; }
    if (k === 7) { card(250, 100, 220, 42, { rx: 8, text: '이용액 > 320만?', fs: 15, stroke: INK });
      grow(220, 122, 130, 210, 1, MUT, { plain: true }); grow(280, 122, 370, 210, 1, ACC, { plain: true, sw: 3 });
      card(130, 232, 120, 40, { rx: 8, text: '예', fs: 15, stroke: GRID }); card(370, 232, 160, 40, { rx: 8, text: '아니오 · 결측', fs: 15, stroke: ACC, color: ACC });
      dot([[250, 30], [250, 100], [370, 232]], seg(u, 0.4, 1.6), BAD, 8); if (u < 0.4) {}
      mono(250, 36, 'NaN', { 'font-size': 15, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: u < 1.6 ? fade(u, 0.2) : 0 });
      note(60, 320, '결측 방향을 분기마다 학습 → 임퓨팅 코드가 없다', fade(u, 1.7));
      sub(250, 360, '상한 2000 → 812 에서 스스로 멈췄다', fade(u, 2.2), { 'font-size': 15 }); } }

  // ---------- 5. RF vs XGBoost ----------
  const LY = [120, 280];
  function lanes(u, o) { o = o || {};
    strip(40, 160, 4, 22, 70, () => INK, 0.8); mono(84, 254, '같은 데이터', { 'font-size': 14, 'text-anchor': 'middle', fill: MUT });
    LY.forEach((y, i) => { grow(130, 195, 200, y, o.g ?? 1, MUT); el('rect', { x: 210, y: y - 50, width: 410, height: 100, rx: 12, fill: i ? ACCBG : GOODBG, opacity: 0.6 });
      tx(226, y - 28, i ? 'XGB — 순차 + 잔차 · 편향 ↓' : 'RF — 병렬 + 투표 · 분산 ↓', { 'font-size': 15, 'font-weight': 700, fill: i ? ACC : GOOD }); }); }
  function s5(t, c) { const { k, u } = c, D = c.beat.duel || {}, votes = (D.bagging || {}).votes || [], pv = ((c.prev && c.prev.duel) || {}).bagging || {};
    if (k === 7) { const S = [['오늘 안에 베이스라인 + 중요도', 'RF', GOOD], ['AUC 0.02 가 큰 금액 차이', 'XGB 튜닝', ACC], ['소규모 팀이 재학습 운영', '강건한 RF', GOOD], ['캐글 · 정형 리더보드', '부스팅 계열', ACC]];
      S.forEach(([a, b, col], i) => { const x = 250 + (i % 2) * 460, y = 120 + Math.floor(i / 2) * 140, s = pop(u, 0.3 + i * 0.4);
        card(x, y, 420, 100, { rx: 12, stroke: col, s }); tx(x - 190, y - 10, a, { 'font-size': 15.5, fill: MUT, 'font-weight': 600, opacity: fade(u, 0.4 + i * 0.4) });
        mono(x - 190, y + 26, '→ ' + b, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.5 + i * 0.4) }); });
      tx(480, 392, '"더 좋은 모델" 이 아니라 "이 상황에 맞는 모델"', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 8) { [['트리: 축에 수직인 분기의 누적', 60, ACC], ['신경망: 매끄러운 곡선', 520, MUT]].forEach(([nm, x, col], i) => {
        const ax = R.axes(x + 20, 70, 300, 250, { x: [0, 10], y: [0, 10] }); lbl(x + 170, 50, nm, 1, { fill: col });
        for (let j = 0; j < 40; j++) { const px = 10 * hash(j, 1, 7), py = 10 * hash(j, 2, 7), pos = (px > 6 && py < 4) || px < 2.5; el('circle', { cx: ax.X(px), cy: ax.Y(py), r: 4.5, fill: pos ? WARN : INFO, opacity: 0.85 }); }
        const g = E(u, 0.4 + i * 0.8, 1.4 + i * 0.8);
        if (!i) { [[2.5, 0, 2.5, 10], [6, 0, 6, 4], [6, 4, 10, 4]].forEach(([a, b, c2, d]) => el('line', { x1: ax.X(a), y1: ax.Y(b), x2: ax.X(lerp(a, c2, g)), y2: ax.Y(lerp(b, d, g)), stroke: ACC, 'stroke-width': 3 })); }
        else { const P = []; for (let j = 0; j <= 30; j++) { const q = j / 30; P.push([lerp(2, 9.8, q), 5.5 - 3 * Math.sin(q * Math.PI * 0.9)]); } R.line(ax, P, g, MUT, { sw: 3, dash: '7 5' }); } });
      tx(480, 400, '이질적 스케일 · 불규칙한 상호작용 → 분기 누적이 유리하다', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    lanes(u, { g: k === 0 ? E(u, 0.3, 0.9) : 1 });
    if (k === 0) { note(660, 140, '데이터 · 분할 · 지표 고정', fade(u, 1.2)); sub(780, 172, '모델만 바꿔 잰다', fade(u, 1.5), { 'font-size': 15 }); }
    if (k >= 1 && k <= 5) LY.forEach((y, i) => { const run = k === 5 ? E(u, 0.2, i ? 2.6 : 1.0) : k === 4 ? E(u, 0.3, i ? 2.4 : 1.0) : 0; clock(590, y + 10, 18, run, i ? ACC : GOOD); });
    if (k === 1) { mono(660, 140, 'import time', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.4) }); mono(660, 180, 'roc_auc_score', { 'font-size': 16, 'font-weight': 700, opacity: fade(u, 0.8) });
      note(660, 260, '점수와 비용(시간)을 함께 잰다', fade(u, 1.6)); }
    if (k >= 2 && k <= 6) { for (let i = 0; i < 12; i++) treeIcon(240 + i * 26, 130, 0.7, GOOD, k === 2 ? fade(u, 0.3 + i * 0.05) : 1); mono(560, 136, '×300', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'end', opacity: k === 2 ? fade(u, 0.9) : 1 });
      votes.forEach((v, i) => { const old = (pv.votes || []).length > i; pill(250 + i * 58, 160, v, v === '연체' ? BAD : GOOD, old ? 1 : pop(u, 0.9 + i * 0.2), { fs: 13.5 }); }); }
    if (k >= 3 && k <= 6) ['lr 0.03', 'depth 5', '0.8', 'L2', 'ES 50'].forEach((s, i) => pill(258 + i * 70, 290, s, ACC, k === 3 ? pop(u, 0.3 + i * 0.25) : 1, { mono: true, fs: 13.5 }));
    if (k === 2) note(660, 140, 'RF 는 기본값 그대로', fade(u, 1.4), { fill: GOOD });
    if (k === 3) note(660, 300, 'XGB 는 Step 4 의 튜닝값', fade(u, 1.6), { fill: ACC });
    if (k === 4) { card(800, 360, 110, 38, { rx: 8, text: 'X_val', fs: 15, mono: true, stroke: WARN, color: WARN, s: pop(u, 0.6) }); grow(800, 340, 640, 300, E(u, 0.8, 1.3), WARN);
      mono(660, 140, 'if "XGB" in name:', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); sub(780, 200, 'XGB 만 eval_set 을 받는다', fade(u, 1.4), { 'font-size': 15 }); }
    if (k === 5) { mono(660, 130, 'predict_proba → AUC', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.3) }); mono(660, 160, 'time.time() − t0', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.6) }); }
    if (k === 6) { const ax = 660; tx(ax, 70, 'AUC', { 'font-size': 15, 'font-weight': 700, fill: MUT }); tx(ax, 222, '학습 시간', { 'font-size': 15, 'font-weight': 700, fill: MUT });
      [['RF', 0.912, '8.4s', 8.4, GOOD], ['XGB', 0.934, '41.2s', 41.2, ACC]].forEach(([nm, auc, ts, sec, col], i) => {
        tx(ax, 102 + i * 50, nm, { 'font-size': 15, 'font-weight': 700, fill: col }); R.hbar(ax + 46, 88 + i * 50, 170, auc - 0.85, 0.1, { u: E(u, 0.3 + i * 0.3, 1.0 + i * 0.3), col, text: auc.toFixed(3) });
        tx(ax, 254 + i * 50, nm, { 'font-size': 15, 'font-weight': 700, fill: col }); R.hbar(ax + 46, 240 + i * 50, 170, sec, 45, { u: E(u, 1.2 + i * 0.3, 1.9 + i * 0.3), col: i ? WARN : col, text: ts }); });
      tx(ax, 360, 'AUC +0.022 · 시간 약 5배', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 2.2) });
      sub(ax + 120, 390, 'AUC 막대는 0.85 부터', fade(u, 2.3), { 'font-size': 13.5 }); } }

  R.page({ title: '앙상블 — 숲의 투표와 잔차 계단', scenes: [s1, s2, s3, s4, s5] });
})();
