/* IV-1-3 Hybrid Search — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * Dense·Sparse top-4 점수는 페이지의 예시 값, RRF·min-max·가중합 값은 그 예시로 numpy 계산한 값이다. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, spans, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const TITLE = { D1: '딥러닝 기초 가이드', D3: '머신러닝 알고리즘 개요', D5: '데이터 전처리 방법', D7: 'XGBoost 하이퍼파라미터 튜닝', D12: 'XGBoost vs LightGBM 비교', D15: 'Gradient Boosting 원리' };
  const SHORT = { D1: '딥러닝 기초', D3: '머신러닝 개요', D5: '데이터 전처리', D7: 'XGBoost 튜닝', D12: 'XGBoost vs LightGBM', D15: 'Gradient Boosting' };
  const POOL = ['D1', 'D3', 'D5', 'D7', 'D12', 'D15'];
  const DCOL = INFO, SCOL = WARN;   // dense = 파랑, sparse = 주황

  function chip(cx, cy, id, o) { o = o || {}; return card(cx, cy, o.w || 50, o.h || 28, { rx: 7, text: id, fs: 14, fw: 800, mono: true, stroke: o.stroke || INK, fill: o.fill || PANEL, color: o.color || INK, sw: o.sw || 2, s: o.s, op: o.op, dash: o.dash }); }
  function hbar(x, y, w, v, max, o) { o = o || {}; const h = o.h || 14;
    el('rect', { x, y: y - h / 2, width: w, height: h, rx: 4, fill: SOFT, opacity: o.op ?? 1 });
    el('rect', { x, y: y - h / 2, width: Math.max(v > 0 ? 2 : 0, w * clamp(v / max)), height: h, rx: 4, fill: o.col || ACC, opacity: o.op ?? 1 });
    if (o.text != null) mono(x + w + 8, y + 5, o.text, { 'font-size': 14.5, 'font-weight': 800, fill: o.tcol || INK, opacity: o.op ?? 1 }); }
  // 제목 속 "XGBoost" 를 강조
  function title(x, y, s, o) { o = o || {}; const parts = s.split(/(XGBoost)/).filter(Boolean).map((p) => [p, p === 'XGBoost' && o.mark ? { fill: SCOL, 'font-weight': 800 } : {}]);
    spans(x, y, parts, { 'font-size': o.fs || 15, 'font-weight': 600, class: null, style: 'white-space:pre', opacity: o.op ?? 1 }); }

  // ---------- 1·2. 한쪽 검색기만 ----------
  const RY = (i) => 112 + i * 62, PY = (i) => 112 + i * 44;
  function pool(got, miss, o) { o = o || {};
    tx(600, 76, '후보 풀 6건', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    POOL.forEach((id, i) => { const y = PY(i), has = got.includes(id), bad = miss === id, a = o.s ? o.s(i) : 1; if (a <= 0) return;
      if (bad) el('rect', { x: 592, y: y - 18, width: 350, height: 36, rx: 8, fill: BADBG, opacity: o.mop ?? 1 });
      chip(630, y, id, { stroke: has ? o.col : bad ? BAD : GRID, fill: has ? o.col : PANEL, color: has ? PANEL : bad ? BAD : MUT, s: a });
      title(665, y + 5, TITLE[id], { fs: 14, op: has ? 1 : 0.55, mark: o.mark });
      if (has) check(922, y, 8, o.cs ? o.cs(id) : 1); else if (bad) cross(922, y, 8, o.mop ?? 1); }); }
  function list(rows, kind, c, o) { o = o || {}; const { u } = c, pn = (c.prev && c.prev[kind]) ? c.prev[kind].length : 0, col = kind === 'dense' ? DCOL : SCOL, max = kind === 'dense' ? 1 : 10;
    tx(24, 76, '#', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(68, 76, '검색 결과 (top-4)', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(380, 76, kind === 'dense' ? '코사인 (예시)' : 'BM25 (예시)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (!rows.length) { tx(250, 200, '아직 결과 없음', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: o.op ?? 1 }); return; }
    rows.forEach((r, i) => { const y = RY(i), isNew = i >= pn, st = 0.2 + (i - pn) * 0.5, a = isNew ? fade(u, st + 0.5, 0.3) : 1;
      if (isNew) { const p = POOL.indexOf(r.id); dot([[630, PY(p)], [560, PY(p)], [90, y]], seg(u, st, st + 0.55), col, 7); }
      if (a <= 0) return;
      mono(24, y + 5, '#' + (i + 1), { 'font-size': 15, 'font-weight': 800, opacity: a });
      chip(86, y, r.id, { stroke: col, fill: col, color: PANEL, op: a });
      title(122, y + 5, TITLE[r.id], { op: a, mark: kind === 'sparse' });
      if (o.note && o.note[0] === r.id) tx(122, y + 26, o.note[1], { 'font-size': 13.5, 'font-weight': 700, fill: o.note[2], opacity: fade(u, 0.6) });
      const g = isNew ? E(u, st + 0.6, st + 1.2) : 1; hbar(380, y, 110, r.s * g, max, { col, text: kind === 'dense' ? (r.s * g).toFixed(2) : (r.s * g).toFixed(1), op: a }); }); }
  function head(kind, s) { pill(110, 34, '질의  XGBoost 튜닝', INK, 1, { fs: 14.5, fill: PANEL });
    pill(330, 34, kind === 'dense' ? 'Dense · 의미 검색' : 'Sparse · BM25 키워드', kind === 'dense' ? DCOL : SCOL, s ?? 1, { fs: 14, fill: kind === 'dense' ? INFOBG : WARNBG }); }

  function s1(t, c) { const { k, u } = c, b = c.beat, rows = b.dense || [];
    head('dense', k === 0 ? pop(u, 0.2) : 1);
    list(rows, 'dense', c, { op: k === 0 ? fade(u, 0.8) : 1, note: k === 3 ? ['D3', '의미만 가까움, 키워드는 빗나감', MUT] : null });
    pool(rows.map((r) => r.id), b.miss, { col: DCOL, s: k === 0 ? (i) => pop(u, 0.5 + i * 0.12) : null, cs: (id) => { const i = rows.findIndex((r) => r.id === id), pn = (c.prev && c.prev.dense) ? c.prev.dense.length : 0; return i >= pn ? pop(u, 0.9 + (i - pn) * 0.5) : 1; }, mop: k === 3 ? fade(u, 0.3) : 1 });
    if (k === 3) banner(480, 386, 'D12 회수 실패 · 고유명사 문서는 임베딩 거리가 멀 수 있다', pop(u, 1.2)); }

  function s2(t, c) { const { k, u } = c, b = c.beat, rows = b.sparse || [];
    head('sparse', k === 0 ? pop(u, 0.8) : 1);
    if (k === 0) { const pd = b.prevDense; tx(24, 76, '직전 Dense 결과', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      pd.forEach((r, i) => { const y = RY(i), op = lerp(1, 0.3, E(u, 0.3, 1.2)); mono(24, y + 5, '#' + (i + 1), { 'font-size': 15, 'font-weight': 800, opacity: op });
        chip(86, y, r.id, { stroke: DCOL, fill: DCOL, color: PANEL, op }); title(122, y + 5, TITLE[r.id], { op }); });
      pill(330, 72, 'dense → sparse', SCOL, pop(u, 1.2), { mono: true, fs: 14, fill: PANEL });
      pool([], null, { col: SCOL, mark: true }); return; }
    if (k === 1) { tx(24, 76, '#', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      card(260, 210, 230, 110, { rx: 12, stroke: SCOL, sw: 2.5, fill: WARNBG, s: pop(u, 0.2) });
      tx(260, 202, 'BM25 인덱스', { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: SCOL, opacity: fade(u, 0.3) });
      const n = Math.round(lerp(0, 6, E(u, 0.6, 2.2))); mono(260, 230, `역색인 ${n}/6건`, { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      POOL.forEach((id, i) => dot([[600, PY(i)], [380, 210]], seg(u, 0.5 + i * 0.25, 1.0 + i * 0.25), SCOL, 6));
      pool([], null, { col: SCOL, mark: true }); return; }
    list(rows, 'sparse', c, { note: k === 4 ? ['D7', '"XGBoost" 키워드 직격', SCOL] : null });
    pool(rows.map((r) => r.id), b.miss, { col: SCOL, mark: true, cs: (id) => { const i = rows.findIndex((r) => r.id === id), pn = (c.prev && c.prev.sparse) ? c.prev.sparse.length : 0; return i >= pn ? pop(u, 0.9 + (i - pn) * 0.5) : 1; }, mop: k === 4 ? fade(u, 0.3) : 1 });
    if (k === 4) banner(480, 386, 'D1 회수 실패 · 겹치는 토큰이 없으면 0점', pop(u, 1.2)); }

  // ---------- 3. RRF ----------
  const CY = (i) => 100 + i * 60, FY = (i) => 100 + i * 46;
  function cols(b, op, u0) {
    tx(20, 60, 'Dense 순위', { 'font-size': 15, 'font-weight': 800, fill: DCOL }); tx(712, 60, 'Sparse 순위', { 'font-size': 15, 'font-weight': 800, fill: SCOL });
    [[b.dense, 24, DCOL, 1], [b.sparse, 714, SCOL, 10]].forEach(([rows, x, col, max]) => rows.forEach((r, i) => { const y = CY(i), a = u0 ? u0(i) : 1;
      mono(x, y + 5, '#' + (i + 1), { 'font-size': 15, 'font-weight': 800, opacity: a });
      chip(x + 56, y, r.id, { stroke: col, fill: col, color: PANEL, op: a });
      tx(x + 88, y + 0, SHORT[r.id], { 'font-size': 14, 'font-weight': 700, opacity: a }); mono(x + 88, y + 20, (max === 1 ? r.s.toFixed(2) : r.s.toFixed(1)), { 'font-size': 13.5, fill: MUT, opacity: a }); })); }
  function s3(t, c) { const { k, u } = c, b = c.beat, ff = b.rrf || [], pn = (c.prev && c.prev.rrf) ? c.prev.rrf.length : 0;
    cols(b, 1, k === 0 ? (i) => fade(u, 0.2 + i * 0.2, 0.3) : null);
    if (k === 0) { [['D7', 1, 0], ['D3', 0, 2]].forEach(([id, di, si], j) => { const g = E(u, 1.2 + j * 0.4, 2.0 + j * 0.4);
        const x1 = 236, y1 = CY(di), x2 = 704, y2 = CY(si);
        el('path', { d: `M${x1},${y1} C${400},${y1} ${430},${y2} ${lerp(x1, x2, g)},${lerp(y1, y2, g)}`, fill: 'none', stroke: ACC, 'stroke-width': 2.5, 'stroke-dasharray': '6 4', opacity: g > 0 ? 1 : 0 }); });
      pill(480, 330, '같은 문서 D7 · D3가 양쪽에 있다', ACC, pop(u, 2.2), { fs: 14.5, fill: PANEL }); return; }
    tx(310, 60, b.calc ? 'RRF = Σ 1/(60 + rank)' : 'RRF 합산 순위', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    ff.forEach((r, i) => { const y = FY(i), isNew = i >= pn, a = isNew ? fade(u, 0.3 + (i - pn) * 0.3, 0.3) : 1;
      chip(330, y, r.id, { stroke: ACC, fill: r.src === 'both' ? ACC : PANEL, color: r.src === 'both' ? PANEL : ACC, op: a });
      if (b.calc) { mono(366, y + 5, r.f + ' =', { 'font-size': 15, 'font-weight': 700, opacity: a }); mono(668, y + 5, r.v.toFixed(4), { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.9 + i * 0.3) }); return; }
      const g = isNew ? E(u, 0.4 + (i - pn) * 0.3, 1.1 + (i - pn) * 0.3) : 1;
      hbar(366, y, 170, r.v * g, 0.0325, { text: (r.v * g).toFixed(4), op: a });
      const lab = r.src === 'both' ? 'D+S' : r.src === 'dense' ? 'D' : 'S', lc = r.src === 'both' ? ACC : r.src === 'dense' ? DCOL : SCOL;
      pill(658, y, lab, lc, isNew ? pop(u, 0.8 + (i - pn) * 0.3) : 1, { fs: 13.5, mono: true, fill: PANEL }); });
    if (b.note) banner(480, 386, '양쪽이 추천하면 위로 · 정규화 없이 순위만 쓴다', pop(u, 0.6)); }

  // ---------- 4. Weighted Sum ----------
  function s4(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 1) { const raw = (v) => 80 + v / 9 * 800, nx = (v) => 140 + v * 720;
      if (k === 0) { const y = 170; el('line', { x1: 80, y1: y, x2: 880, y2: y, stroke: MUT, 'stroke-width': 2 });
        [0, 3, 6, 9].forEach((v) => mono(raw(v), y + 26, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
        tx(80, 80, '두 점수를 한 자에 올리면', { 'font-size': 16, 'font-weight': 800 });
        b.dense.forEach((r, i) => { const s = pop(u, 0.3 + i * 0.1); el('circle', { cx: raw(r.s), cy: y - 12 - i * 9, r: 6 * s, fill: DCOL }); });
        tx(raw(0.8), y - 64, 'Dense 4건 (0.70~0.92)', { 'font-size': 14.5, 'font-weight': 800, fill: DCOL, opacity: fade(u, 0.8) });
        b.sparse.forEach((r, i) => { const s = pop(u, 0.9 + i * 0.15); el('circle', { cx: raw(r.s), cy: y, r: 7 * s, fill: SCOL }); mono(raw(r.s), y - 16, r.id, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: SCOL, opacity: clamp(s) }); });
        tx(raw(6), y - 64, 'Sparse 4건 (3.8~8.5)', { 'font-size': 14.5, 'font-weight': 800, fill: SCOL, opacity: fade(u, 1.4) });
        tx(480, 280, '그대로 더하면 sparse 점수가 순위를 다 정한다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: BAD, opacity: fade(u, 2.0) });
        return; }
      [['dense', b.dense, DCOL, 130, '0.70 → 0 · 0.92 → 1'], ['sparse', b.sparse, SCOL, 280, '3.8 → 0 · 8.5 → 1']].forEach(([key, rows, col, y, rule]) => {
        el('line', { x1: nx(0), y1: y, x2: nx(1), y2: y, stroke: MUT, 'stroke-width': 2 }); mono(nx(0), y + 24, '0', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); mono(nx(1), y + 24, '1', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' });
        tx(40, y - 52, (key === 'dense' ? 'Dense' : 'Sparse') + ' min-max', { 'font-size': 15, 'font-weight': 800, fill: col }); mono(230, y - 52, rule, { 'font-size': 14, fill: MUT });
        rows.forEach((r) => { const v = b.norm[key][r.id], g = E(u, 0.3, 1.5), x = lerp(raw(r.s), nx(v), g);
          el('circle', { cx: x, cy: y, r: 7, fill: col }); mono(x, y - 14, r.id, { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: key === 'dense' ? fade(u, 1.1) : 1 });
          mono(x, y + 44, v.toFixed(2), { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.5) }); });
        if (key === 'dense') el('rect', { x: nx(0.82) - 24, y: y - 32, width: 48, height: 86, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.9) }); });
      el('rect', { x: nx(1) - 24, y: 280 - 32, width: 48, height: 86, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: fade(u, 1.9) });
      tx(480, 400, '목록의 꼴찌는 0이 된다 (D5 · D15)', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    if (k <= 3) { const order0 = ['D3', 'D7', 'D1', 'D5', 'D12', 'D15'], W = b.w, val = Object.fromEntries(W), N = b.norm;
      tx(30, 60, '문서', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(120, 60, 'dense', { 'font-size': 14, fill: DCOL, 'font-weight': 700 }); tx(210, 60, 'sparse', { 'font-size': 14, fill: SCOL, 'font-weight': 700 });
      tx(470, 60, `α = ${b.alpha}  →  α·dense + (1−α)·sparse`, { 'font-size': 15, 'font-weight': 800, fill: ACC });
      order0.forEach((id, i0) => { const i1 = W.findIndex(([x]) => x === id), y = k === 2 ? 100 + i0 * 46 : lerp(100 + i0 * 46, 100 + i1 * 46, E(u, 0.2, 1.2)), d = N.dense[id] ?? 0, s = N.sparse[id] ?? 0, v = val[id];
        if (k === 3 && i1 === 0) el('rect', { x: 14, y: y - 20, width: 920, height: 40, rx: 8, fill: ACCBG, opacity: fade(u, 1.2) });
        chip(60, y, id, { stroke: ACC }); mono(120, y + 5, d.toFixed(2), { 'font-size': 15, fill: DCOL, 'font-weight': 700 }); mono(210, y + 5, s.toFixed(2), { 'font-size': 15, fill: SCOL, 'font-weight': 700 });
        const g = k === 2 ? E(u, 0.4 + i0 * 0.2, 1.2 + i0 * 0.2) : 1; hbar(470, y, 330, v * g, 1, { text: (v * g).toFixed(3), tcol: v ? INK : MUT });
        if (k === 3) mono(440, y + 5, '#' + (i1 + 1), { 'font-size': 14, 'font-weight': 800, 'text-anchor': 'end', opacity: fade(u, 1.2) }); });
      if (k === 2) mono(480, 396, 'D7 = 0.5 × 0.82 + 0.5 × 1.00 = 0.909', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.8) });
      return; }
    // k4: α 를 돌리면
    [[0.3, '키워드 쪽'], [0.5, '반반'], [0.7, '의미 쪽']].forEach(([al, nm], j) => { const x = 170 + j * 310, rows = b.wa[al], s = pop(u, 0.2 + j * 0.4);
      card(x, 56, 220, 40, { rx: 20, text: `α = ${al} · ${nm}`, fs: 15, fw: 800, stroke: j === 0 ? SCOL : j === 2 ? DCOL : ACC, fill: PANEL, s });
      rows.forEach(([id, v], i) => { const y = 108 + i * 44, a = fade(u, 0.4 + j * 0.4 + i * 0.06), hot = id === 'D12' ? SCOL : id === 'D1' ? DCOL : null;
        if (hot) el('rect', { x: x - 120, y: y - 18, width: 240, height: 36, rx: 8, fill: hot === SCOL ? WARNBG : INFOBG, opacity: a });
        mono(x - 104, y + 5, '#' + (i + 1), { 'font-size': 14, 'font-weight': 800, opacity: a }); chip(x - 44, y, id, { stroke: hot || GRID, op: a });
        mono(x + 100, y + 5, v.toFixed(3), { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'end', opacity: a }); }); });
    tx(480, 400, 'α를 올리면 D1이, 내리면 D12가 위로 온다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); }

  // ---------- 5. 결과 ----------
  const GOT = { Dense: ['D3', 'D7', 'D1', 'D5'], Sparse: ['D7', 'D12', 'D3', 'D15'], Hybrid: POOL };
  function s5(t, c) { const { k, u } = c, b = c.beat;
    if (k === 0) { Object.entries(GOT).forEach(([nm, got], j) => { const x = 170 + j * 310, col = j === 0 ? DCOL : j === 1 ? SCOL : ACC, s = pop(u, 0.2 + j * 0.5);
        card(x, 52, 200, 40, { rx: 20, text: `${nm}  ${got.length}/6`, fs: 16, fw: 800, color: j === 2 ? PANEL : col, fill: j === 2 ? ACC : PANEL, stroke: col, s });
        POOL.forEach((id, i) => { const y = 106 + i * 44, has = got.includes(id), a = fade(u, 0.4 + j * 0.5 + i * 0.06, 0.3);
          chip(x - 40, y, id, { stroke: has ? col : GRID, fill: has ? col : PANEL, color: has ? PANEL : MUT, op: a, dash: has ? null : '4 3' });
          if (has) check(x + 30, y, 8, a); else cross(x + 30, y, 7, a); }); });
      tx(480, 390, '두 목록을 합치면 후보 풀 6건을 모두 회수한다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k <= 2) { const ff = b.rrf;
      tx(24, 50, 'RRF 최종 순위', { 'font-size': 15, 'font-weight': 800, fill: ACC });
      ff.forEach((r, i) => { const y = 84 + i * 50, hot = r.id === 'D12' || r.id === 'D1';
        if (hot) el('rect', { x: 14, y: y - 20, width: 560, height: 40, rx: 8, fill: r.id === 'D12' ? WARNBG : INFOBG, opacity: k === 1 ? fade(u, 1.0) : 1 });
        mono(24, y + 5, '#' + (i + 1), { 'font-size': 15, 'font-weight': 800 }); chip(86, y, r.id, { stroke: ACC, fill: r.src === 'both' ? ACC : PANEL, color: r.src === 'both' ? PANEL : ACC });
        tx(122, y + 5, TITLE[r.id], { 'font-size': 15, 'font-weight': 600 }); mono(430, y + 5, r.v.toFixed(4), { 'font-size': 14.5, 'font-weight': 700 });
        const lab = r.src === 'both' ? 'D+S' : r.src === 'dense' ? 'D' : 'S', lc = r.src === 'both' ? ACC : r.src === 'dense' ? DCOL : SCOL; pill(540, y, lab, lc, 1, { fs: 13.5, mono: true, fill: PANEL }); });
      const cy = 84 + 3.5 * 50, g = k === 1 ? E(u, 0.4, 1.2) : 1; grow(14, cy, 14 + 560 * g, cy, 1, BAD, { plain: true, dash: '6 4', sw: 2 });
      if (k === 1) pill(620, cy, 'top-4', BAD, pop(u, 1.1), { fs: 14, mono: true, fill: PANEL });
      if (k === 1) { tx(700, 120, '1위 D7: 양쪽이 모두 추천', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.5) });
        tx(700, 160, 'top-4 안에 D12와 D1이 함께', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.9) }); }
      if (k === 2) { [['D12', 'Sparse가 잡음', '고유명사 문서', SCOL, 2], ['D1', 'Dense가 잡음', '의미가 가까운 문서', DCOL, 3]].forEach(([id, a, s, col, row], j) => {
          const y = 120 + j * 150, p = pop(u, 0.3 + j * 0.6); card(810, y, 240, 70, { rx: 12, stroke: col, sw: 2.5, fill: j ? INFOBG : WARNBG, s: p });
          tx(810, y - 4, a, { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: clamp(p) }); tx(810, y + 20, s, { 'font-size': 14, 'text-anchor': 'middle', fill: MUT, opacity: clamp(p) });
          grow(688, y, 590, 84 + row * 50, E(u, 0.6 + j * 0.6, 1.2 + j * 0.6), col, { sw: 2.5 }); }); }
      return; }
    // k3: 고르는 법 + 다음
    [['빠른 PoC · 점수 스케일 모름', 'RRF', ACC], ['도메인 튜닝 (법률 · 의료)', 'Weighted · α', INFO], ['한쪽 검색기가 매우 강함', 'RRF', ACC]].forEach(([a, r, col], i) => {
      const y = 70 + i * 66, p = pop(u, 0.2 + i * 0.3); card(250, y, 420, 52, { rx: 10, stroke: GRID, sw: 1.8, s: p });
      tx(60, y + 6, a, { 'font-size': 15, 'font-weight': 700, opacity: clamp(p) }); pill(400, y, r, col, p, { fs: 14.5, fill: PANEL }); });
    const steps = [['Hybrid top-20', ACC], ['cross-encoder', INFO], ['다시 정렬된 top-k', GOOD]];
    tx(560, 60, '다음: IV-2-1 Re-ranking', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 1.1) });
    steps.forEach(([s, col], i) => { const y = 110 + i * 90, p = pop(u, 1.2 + i * 0.35); card(740, y, 260, 56, { rx: 28, text: s, fs: 16, fw: 800, stroke: col, sw: 2.5, fill: PANEL, color: col, s: p });
      if (i) grow(740, y - 62, 740, y - 30, E(u, 1.1 + i * 0.35, 1.4 + i * 0.35), col); }); }

  const quiz = [
    { q: 'Dense 검색만 썼을 때 "XGBoost vs LightGBM"(D12)이 빠진 까닭으로 가장 알맞은 것은 무엇인가?',
      o: ['BM25 점수가 0이라서', '고유명사 중심 문서라 임베딩 거리가 멀어서', 'top-k가 너무 커서'], a: 1,
      why: 'Dense는 의미가 비슷한 순으로 고른다. 고유명사가 중심인 문서는 질의와 벡터 거리가 멀어 top-4 밖으로 밀릴 수 있다.' },
    { q: 'Sparse(BM25) 검색만 썼을 때 "딥러닝 기초 가이드"(D1)가 빠진 이유는 무엇인가?',
      o: ['질의와 겹치는 토큰이 없어 0점이라서', '문서가 너무 길어서', '임베딩 모델이 한국어를 몰라서'], a: 0,
      why: 'BM25는 같은 토큰이 있어야 점수를 준다. D1에는 "XGBoost"도 "튜닝"도 없어 0점이다.' },
    { q: 'RRF에서 D7이 1위가 된 이유는 무엇인가?',
      o: ['BM25 점수 8.5가 가장 커서', '제목이 가장 길어서', '두 목록 모두에서 상위라 1/62 + 1/61을 받아서'], a: 2,
      why: 'RRF는 순위만 본다. D7은 dense 2위, sparse 1위라 두 항을 모두 받아 0.0325로 가장 높다.' },
    { q: '가중합 전에 min-max 정규화를 하는 이유는 무엇인가?',
      o: ['문서 수를 줄이려고', '0.70~0.92와 3.8~8.5처럼 다른 단위를 같은 0~1 자로 맞추려고', '순위를 무작위로 섞으려고'], a: 1,
      why: '정규화하지 않으면 큰 단위인 sparse 점수가 합을 지배한다. 0~1로 맞춘 뒤에야 α가 두 점수의 비중을 정한다.' },
    { q: 'top-4로 잘랐을 때 Hybrid(RRF) 결과에 들어 있는 문서 조합은 무엇인가?',
      o: ['D3 · D7 · D1 · D5', 'D7 · D12 · D3 · D15', 'D7 · D3 · D12 · D1'], a: 2,
      why: 'RRF 순위는 D7, D3, D12, D1이다. Dense가 놓친 D12와 Sparse가 놓친 D1이 같은 top-4에 함께 들어온다.' },
  ];

  const summary = [
    'Dense만 쓰면 고유명사 문서 D12를, Sparse만 쓰면 의미가 가까운 D1을 놓쳤다.',
    'RRF는 순위만 써서 1/(60+rank)를 더한다. 양쪽에 다 있는 D7이 0.0325로 1위가 됐다.',
    '가중합은 min-max로 0~1을 맞춘 뒤 α로 섞는다. α를 올리면 의미 쪽 문서가 오른다.',
    '두 결과를 합치면 top-4 안에 D12와 D1이 함께 들어온다. 튜닝 전에는 RRF가 무난하다.',
  ];
  const review = [
    { q: '법률 검색에 Hybrid 가중합을 붙였더니 조문 번호를 정확히 적은 질문에도 의미만 비슷한 판례가 위로 온다. 먼저 바꿀 것은?',
      o: ['α를 낮춰 sparse 쪽 비중을 키운다', 'RRF의 k를 60에서 1로 바꾼다', 'min-max 정규화를 뺀다'], a: 0,
      why: 'α는 dense 쪽 비중이다. 정확한 용어가 중요한 도메인에서는 α를 낮춰 키워드 점수의 몫을 키운다.' },
    { q: '점수 정규화 없이 0.5·dense + 0.5·sparse를 더했더니 순위가 BM25 단독과 똑같다. 원인은?',
      o: ['dense 검색기가 결과를 돌려주지 않아서', 'sparse 점수의 단위(3.8~8.5)가 dense(0.70~0.92)보다 훨씬 커서', 'RRF를 같이 써서'], a: 1,
      why: '단위가 큰 쪽이 합을 지배한다. min-max로 둘을 0~1에 맞추거나 순위만 쓰는 RRF를 써야 두 검색기가 함께 반영된다.' },
    { q: '새 검색 서비스를 급히 열어야 하는데 두 검색기 점수의 분포를 아직 모른다. 어떤 결합이 무난한가?',
      o: ['α를 0.9로 둔 가중합', 'Dense 결과만 쓰고 나중에 합친다', '순위만 쓰는 RRF'], a: 2,
      why: 'RRF는 점수 스케일과 상관없이 순위로만 합치므로 튜닝 없이 바로 쓸 수 있다. 데이터가 쌓이면 가중합의 α를 맞춰 볼 수 있다.' },
  ];

  R.page({ title: '두 검색기를 하나로 합치기', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
