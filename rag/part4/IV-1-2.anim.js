/* IV-1-2 Sparse Retrieval (BM25) — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 1·2장면의 단어 점수는 페이지 숫자(N=1000, df, tf)를 log10 IDF 로 다시 계산한 값,
 * 2·3장면의 문서 점수는 rank_bm25 BM25Okapi 를 예시 코퍼스 D1~D8 에 실제로 돌린 값이다. Dense 점수는 예시 값. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, dot, spans, cross, check } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;
  const QW = ['machine', 'learning', 'XGBoost'];

  // 막대 하나 (x, y 가운데), 값 v / max, 길이 w
  function bar(x, y, w, v, max, o) { o = o || {}; const h = o.h || 18;
    el('rect', { x, y: y - h / 2, width: w, height: h, rx: 4, fill: SOFT, opacity: o.op ?? 1 });
    el('rect', { x, y: y - h / 2, width: Math.max(v > 0 ? 2 : 0, w * clamp(v / max)), height: h, rx: 4, fill: o.col || ACC, opacity: o.op ?? 1 });
    if (o.text != null) mono(x + w + 10, y + 5, o.text, { 'font-size': 15, 'font-weight': 800, fill: o.tcol || INK, opacity: o.op ?? 1 }); }
  // 왼쪽 정렬 토큰 칩 한 줄
  function toks(x, y, ws, o) { o = o || {}; let cx = x; const fs = o.fs || 14;
    ws.forEach((w, i) => { const wd = tw(w, fs) + 18, st = (o.style && o.style(i, w)) || {}, s = o.s ? o.s(i) : 1;
      card(cx + wd / 2, y, wd, fs + 14, { rx: 7, text: w, fs, fw: 700, mono: o.mono !== false, stroke: st.stroke || GRID, fill: st.fill || PANEL, color: st.color || INK, sw: st.sw || 1.6, s, op: st.op });
      cx += wd + (o.gap ?? 6); }); return cx; }

  // ---------- 1. TF-IDF ----------
  const NOTHE = new Set(Array.from({ length: 50 }, (_, i) => i * 20 + ((i * 7) % 20)));
  const XG = new Set([3, 211, 487, 702, 915]);
  const G0 = { x: 24, y: 80, p: 8, c: 6.5 };
  function grid(t, k, u) { for (let i = 0; i < 1000; i++) { const r = Math.floor(i / 40), cc = i % 40, x = G0.x + cc * G0.p, y = G0.y + r * G0.p;
      const a = k === 0 ? fade(u, 0.2 + r * 0.06, 0.2) : 1; if (a <= 0) continue;
      let fill = OFF, op = 0.45;
      if (k >= 2) { if (XG.has(i)) { fill = ACC; op = 1; } else if (!NOTHE.has(i)) { fill = MUT; op = 0.35; } else { fill = PANEL; op = 1; } }
      el('rect', { x, y, width: G0.c, height: G0.c, rx: 1, fill, opacity: op * a, stroke: k >= 2 && NOTHE.has(i) && !XG.has(i) ? GRID : 'none', 'stroke-width': 0.8 }); }
    tx(G0.x, 46, '코퍼스 N = 1000 문서', { 'font-size': 15, 'font-weight': 800 });
    if (k >= 1) { const x = G0.x + 3 * G0.p + 3, y = G0.y + 3;
      el('circle', { cx: x, cy: y, r: 9, fill: 'none', stroke: INK, 'stroke-width': 2.5 }); tx(x + 14, G0.y - 10, 'D3', { 'font-size': 15, 'font-weight': 800 }); }
    if (k >= 2) { const op = k === 2 ? fade(u, 0.4) : 1;
      el('rect', { x: 24, y: 296, width: 12, height: 12, fill: MUT, opacity: 0.5 * op }); tx(42, 307, '"the"가 든 문서 950', { 'font-size': 14, opacity: op });
      el('rect', { x: 200, y: 296, width: 12, height: 12, fill: ACC, opacity: op }); tx(218, 307, 'XGBoost 든 문서 5', { 'font-size': 14, fill: ACC, 'font-weight': 700, opacity: op }); } }
  function s1(t, c) { const { k, u } = c, T = c.beat.terms;
    QW.forEach((w, i) => pill(560 + i * 125, 44, w, ACC, k === 0 ? pop(u, 0.4 + i * 0.3) : 1, { mono: true, fs: 14, fill: PANEL }));
    tx(420, 50, '질의', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    if (k < 5) grid(t, k, u);
    else { // TF 선형 증가 — 작은 그래프
      const x0 = 50, y0 = 300, w = 290, h = 210, X = (v) => x0 + v / 20 * w, Y = (v) => y0 - v / 20 * h;
      el('line', { x1: x0, y1: y0, x2: x0 + w, y2: y0, stroke: MUT, 'stroke-width': 1.8 }); el('line', { x1: x0, y1: y0, x2: x0, y2: y0 - h, stroke: MUT, 'stroke-width': 1.8 });
      tx(x0 + w, y0 + 24, 'TF (등장 횟수)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end' }); tx(x0, y0 - h - 10, 'TF 점수', { 'font-size': 14, fill: MUT });
      grow(X(0), Y(0), X(20), Y(20), E(u, 0.2, 1.2), BAD, { plain: true, sw: 3 });
      tx(X(9), Y(16), '2배 나오면 2배 점수', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.2) });
      tx(x0, 340, '긴 문서일수록 TF가 커서 유리하다', { 'font-size': 15, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.8) }); }
    const head = ['', 'TF (D3 안 횟수)', 'IDF = log10(1000 / df)', 'tf × idf', 'TF · IDF', 'TF · IDF'][k];
    if (k === 0) { tx(640, 200, '아직 점수 없음', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 1.4) }); return; }
    tx(420, 84, head, { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    T.forEach((r, i) => { const y = 120 + i * 62, isQ = r.w !== 'the', dim = (k === 4 && !isQ) ? 0.3 : 1;
      mono(420, y + 5, r.w, { 'font-size': 16, 'font-weight': 800, fill: isQ ? ACC : INK, opacity: dim });
      if (k >= 2) mono(420, y + 25, 'df ' + r.df, { 'font-size': 13.5, fill: MUT, opacity: dim });
      if (k === 1) bar(540, y, 280, r.tf * E(u, 0.2 + i * 0.25, 1.0 + i * 0.25), 16, { col: isQ ? ACC : MUT, text: String(r.tf) });
      if (k === 2) { const g = E(u, 0.6 + i * 0.3, 1.4 + i * 0.3); bar(540, y, 280, r.idf * g, 2.5, { col: isQ ? ACC : MUT, text: (r.idf * g).toFixed(2) }); }
      if (k === 3) { mono(540, y + 5, `${r.tf} × ${r.idf.toFixed(2)}`, { 'font-size': 17, 'font-weight': 700, opacity: fade(u, 0.3 + i * 0.25) });
        mono(700, y + 5, '= ?', { 'font-size': 17, fill: MUT, opacity: fade(u, 0.5 + i * 0.25) }); }
      if (k >= 4) { if (!isQ && k === 4) { tx(540, y + 5, '질의에 없는 단어', { 'font-size': 14, fill: MUT, opacity: dim }); return; }
        const g = k === 4 ? E(u, 0.2 + i * 0.3, 1.0 + i * 0.3) : !isQ ? E(u, 0.2, 0.9) : 1; bar(540, y, 280, r.tfidf * g, 7.5, { col: isQ ? ACC : MUT, text: (r.tfidf * g).toFixed(2), op: dim }); } });
    if (k === 3) card(640, 380, 420, 46, { rx: 23, fill: INK, stroke: 'none', text: 'TF-IDF = tf × log10(N / df)', fs: 16, fw: 800, color: PANEL, mono: true, s: pop(u, 1.4) });
    if (k === 4) { card(700, 382, 320, 46, { rx: 10, stroke: ACC, sw: 2.5, fill: ACCBG, s: pop(u, 1.6) });
      mono(700, 388, '합계 7.37 + 6.00 + 6.90 = 20.27', { 'font-size': 15, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); } }

  // ---------- 2. BM25 ----------
  const DY = (i) => 64 + i * 36;
  function docRows(docs, o) { o = o || {};
    docs.forEach((d, i) => { const y = DY(i), a = o.s ? o.s(i) : 1; if (a <= 0) return; const hot = o.top && o.top.includes(i);
      if (hot) el('rect', { x: 8, y: y - 16, width: 944, height: 32, rx: 8, fill: ACCBG, opacity: o.hop ?? 1 });
      tx(16, y + 5, 'D' + (i + 1), { 'font-size': 14.5, 'font-weight': 800, opacity: a, fill: i < 4 ? INK : MUT });
      const parts = []; d.split(' ').forEach((w, j) => { if (j) parts.push([' ', {}]); parts.push([w, o.mark && QW.includes(w) ? { fill: ACC, 'font-weight': 800 } : { fill: i < 4 ? INK : MUT }]); });
      spans(52, y + 5, parts, { 'font-size': 14, opacity: a }); }); }
  function satAxes(ymax, o) { o = o || {}; const x0 = 70, y0 = 330, w = 400, h = 250, X = (v) => x0 + v / 20 * w, Y = (v) => y0 - v / ymax * h;
    el('line', { x1: x0, y1: y0, x2: x0 + w, y2: y0, stroke: MUT, 'stroke-width': 1.8 }); el('line', { x1: x0, y1: y0, x2: x0, y2: y0 - h, stroke: MUT, 'stroke-width': 1.8 });
    [0, 5, 10, 15, 20].forEach((v) => mono(X(v), y0 + 20, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    (o.yt || []).forEach((v) => mono(x0 - 8, Y(v) + 5, String(v), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }));
    tx(x0 + w, y0 + 44, 'TF (문서 안 등장 횟수)', { 'font-size': 14, fill: MUT, 'text-anchor': 'end', 'font-weight': 600 });
    tx(x0, y0 - h - 12, o.yl || 'TF 부분 점수', { 'font-size': 14, fill: MUT, 'font-weight': 600 }); return { X, Y }; }
  const sat = (k1, r) => (x) => (x * (k1 + 1)) / (x + k1 * (0.25 + 0.75 * r));
  function curve(ax, f, u, col, o) { o = o || {}; const n = Math.round(40 * clamp(u)); if (n < 1) return; const pts = [];
    for (let i = 0; i <= n; i++) { const x = i / 2; pts.push(ax.X(x) + ',' + ax.Y(f(x))); }
    el('polyline', { points: pts.join(' '), fill: 'none', stroke: col, 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round' }); }
  function s2(t, c) { const { k, u } = c, b = c.beat;
    if (k <= 3) {
      docRows(b.docs, { s: k === 0 ? (i) => fade(u, 0.2 + i * 0.2, 0.3) : null, mark: k >= 2, top: k === 3 ? [2, 1] : null, hop: k === 3 ? fade(u, 0.3) : 1 });
      if (k === 0) { tx(560, 40, 'D3의 토큰 6개', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.8) });
        toks(560, 76, ['the', 'XGBoost', 'machine'], { s: (i) => pop(u, 1.9 + i * 0.12) }); toks(560, 116, ['learning', 'model', 'wins'], { s: (i) => pop(u, 2.2 + i * 0.12) }); return; }
      if (k === 1) { [['k1 = 1.5', ACC], ['b = 0.75', ACC], ['avgdl = 5.5', INFO]].forEach(([s, col], i) => pill(600 + i * 120, 52, s, col, pop(u, 0.2 + i * 0.25), { mono: true, fs: 14, fill: PANEL }));
        tx(540, 110, '질의 단어의 IDF (문서 8개 기준)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.9) });
        b.idf.forEach((r, i) => { const y = 148 + i * 50, g = E(u, 1.0 + i * 0.3, 1.7 + i * 0.3);
          mono(540, y + 5, r.w, { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0 + i * 0.3) }); mono(640, y + 5, `${r.df}/8`, { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0 + i * 0.3) });
          bar(700, y, 150, r.idf * g, 1, { text: (r.idf * g).toFixed(3) }); });
        tx(480, 400, 'score = Σ IDF · tf·(k1+1) / (tf + k1·(1 − b + b·|d|/avgdl))', { 'font-size': 15, 'font-weight': 700, class: 'mono', 'text-anchor': 'middle', opacity: fade(u, 1.8) }); return; }
      tx(560, 36, 'BM25 점수', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      b.scores.forEach((v, i) => { const g = k === 2 ? E(u, 0.3 + i * 0.12, 1.2 + i * 0.12) : 1; bar(560, DY(i), 260, v * g, 2.5, { text: (v * g).toFixed(3), col: i === 2 ? ACC : INK, tcol: v ? INK : MUT, h: 16 }); });
      if (k === 3) { pill(480, 380, 'get_top_n(query, corpus, n=2) → [D3, D2]', ACC, pop(u, 0.8), { mono: true, fs: 14.5, fill: PANEL });
        ['1위', '2위'].forEach((s, j) => tx(930, DY(j === 0 ? 2 : 1) + 5, s, { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 0.5) })); }
      return; }
    if (k === 4) { const ax = satAxes(8, { yt: [0, 2.5, 5, 7.5] });
      const lin = Math.min(1, E(u, 0.2, 1.0));
      grow(ax.X(0), ax.Y(0), ax.X(8), ax.Y(8), lin, BAD, { plain: true, sw: 3 }); tx(ax.X(8) + 8, ax.Y(8) + 4, 'TF-IDF: 계속 커짐', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: fade(u, 1.0) });
      curve(ax, sat(1.5, 1), E(u, 0.8, 1.8), ACC); el('line', { x1: ax.X(0), y1: ax.Y(2.5), x2: ax.X(20), y2: ax.Y(2.5), stroke: ACC, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: fade(u, 1.6) });
      tx(ax.X(20), ax.Y(2.5) - 10, 'k1+1 = 2.5에서 멈춤', { 'font-size': 14.5, 'font-weight': 800, fill: ACC, 'text-anchor': 'end', opacity: fade(u, 1.7) });
      [[3, 'XGBoost'], [8, 'machine']].forEach(([x, w], i) => { const s = pop(u, 1.9 + i * 0.2), y = sat(1.5, 1)(x);
        el('circle', { cx: ax.X(x), cy: ax.Y(y), r: 7 * s, fill: PANEL, stroke: ACC, 'stroke-width': 3 }); mono(ax.X(x), ax.Y(y) + 28, `${w} tf=${x}`, { 'font-size': 13.5, 'text-anchor': 'middle', 'font-weight': 700, opacity: clamp(s) }); });
      // 오른쪽: 역전
      const T = b.terms, m = T[1], xg = T[3];
      tx(560, 70, 'TF · IDF', { 'font-size': 15, 'font-weight': 800, fill: MUT });
      bar(660, 104, 170, m.tfidf, 8, { text: m.tfidf.toFixed(2), col: MUT }); mono(560, 109, 'machine', { 'font-size': 14.5, 'font-weight': 700 });
      bar(660, 140, 170, xg.tfidf, 8, { text: xg.tfidf.toFixed(2), col: MUT }); mono(560, 145, 'XGBoost', { 'font-size': 14.5, 'font-weight': 700 });
      const g = E(u, 1.2, 2.2);
      tx(560, 210, 'BM25', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.1) });
      bar(660, 244, 170, tween(m.tfidf, m.bm25, g, 0.9), 8, { text: tween(m.tfidf, m.bm25, g, 0.9).toFixed(2), col: ACC }); mono(560, 249, 'machine', { 'font-size': 14.5, 'font-weight': 700 });
      bar(660, 280, 170, tween(xg.tfidf, xg.bm25, g, 0.9), 8, { text: tween(xg.tfidf, xg.bm25, g, 0.9).toFixed(2), col: ACC }); mono(560, 285, 'XGBoost', { 'font-size': 14.5, 'font-weight': 800, fill: ACC });
      pill(720, 340, '순위 역전: XGBoost > machine', ACC, pop(u, 2.3), { fs: 14.5, fill: PANEL }); return; }
    // k5: k1 과 b
    const ax = satAxes(3.5, { yt: [0, 1, 2, 3] });
    [[1.2, 1, INFO, null, 'k1 = 1.2'], [1.5, 1, ACC, null, 'k1 = 1.5'], [2.0, 1, WARN, null, 'k1 = 2.0'], [1.5, 2, BAD, '6 5', '문서 길이 2배 (k1 1.5)']].forEach(([k1, r, col, dash, name], i) => {
      curve(ax, sat(k1, r), E(u, 0.2 + i * 0.35, 1.0 + i * 0.35), col, { dash });
      const y = 90 + i * 44, op = fade(u, 0.4 + i * 0.35);
      el('line', { x1: 560, y1: y, x2: 600, y2: y, stroke: col, 'stroke-width': 3, 'stroke-dasharray': dash, opacity: op });
      tx(612, y + 5, name, { 'font-size': 15, 'font-weight': 700, opacity: op });
      mono(930, y + 5, 'tf=3 → ' + sat(k1, r)(3).toFixed(2), { 'font-size': 14, 'text-anchor': 'end', fill: col, 'font-weight': 700, opacity: op }); });
    tx(560, 300, 'k1 ↑ → TF 영향 ↑    b ↑ → 길이 보정 ↑', { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 1.8) });
    pill(720, 350, 'Elasticsearch 기본 스코어러 = BM25', INK, pop(u, 2.1), { fs: 14, fill: PANEL }); }

  // ---------- 3. 역색인과 정확 매칭 ----------
  const INV = [['learning', [2, 3, 4]], ['machine', [2, 3]], ['XGBoost', [3, 4]], ['torch.nn.functional.softmax', [5]], ['K8s', [6]], ['CRD', [6]], ['apiVersion', [6]], ['v1beta1', [6]]];
  const QT = [null, ['XGBoost', '1.7.6', 'hyperparameter'], ['torch.nn.functional.softmax'], ['K8s', 'CRD', 'apiVersion', 'v1beta1']];
  function s3(t, c) { const { k, u } = c, q = c.beat.q;
    const qi = k >= 1 && k <= 3 ? k : k > 3 ? 3 : 0, qt = qi ? QT[qi] : [];
    tx(20, 40, '역색인 (단어 → 문서 목록, 일부)', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
    INV.forEach(([w, ds], i) => { const y = 72 + i * 38, s = k === 0 ? fade(u, 0.2 + i * 0.22, 0.3) : 1, hit = qt.includes(w) && k <= 4;
      if (s <= 0) return;
      if (hit) el('rect', { x: 8, y: y - 16, width: 446, height: 32, rx: 8, fill: ACCBG, opacity: k <= 3 ? fade(u, 0.5) : 1 });
      mono(250, y + 5, w, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: hit ? ACC : INK, opacity: s });
      grow(258, y, 290, y, k === 0 ? E(u, 0.3 + i * 0.22, 0.6 + i * 0.22) : 1, hit ? ACC : MUT, { sw: 1.8 });
      ds.forEach((d, j) => card(318 + j * 46, y, 40, 26, { rx: 6, text: 'D' + d, fs: 13.5, fw: 800, mono: true, stroke: hit ? ACC : GRID, fill: hit ? ACC : PANEL, color: hit ? PANEL : INK, sw: 1.6, s: k === 0 ? pop(u, 0.5 + i * 0.22) : 1 })); });
    if (k === 0) { tx(700, 200, '질의를 기다리는 중', { 'font-size': 15, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    if (k <= 3) {
      tx(490, 40, '질의 토큰', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const inIdx = (w) => INV.some(([x]) => x === w);
      let cx = 490; qt.forEach((w, i) => { const fs = qt.length > 3 ? 13.5 : 14, wd = tw(w, fs) + 18, ok = inIdx(w), s = pop(u, 0.2 + i * 0.2);
        card(cx + wd / 2, 72, wd, 28, { rx: 7, text: w, fs, fw: 700, mono: true, stroke: ok ? ACC : GRID, fill: ok ? ACCBG : PANEL, color: ok ? ACC : MUT, sw: 2, s });
        if (!ok) mono(cx + wd / 2, 104, '색인에 없음', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: fade(u, 0.8) }); cx += wd + 6; });
      tx(490, 140, 'BM25 점수', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      q.sc.forEach((v, i) => { const y = 166 + i * 28, g = E(u, 1.0, 2.0); mono(490, y + 5, 'D' + (i + 1), { 'font-size': 14, 'font-weight': 800, fill: v ? ACC : MUT });
        bar(530, y, 300, v * g, 6, { h: 14, text: (v * g).toFixed(3), tcol: v ? INK : MUT }); });
      return; }
    if (k === 4) { [['단어 하나 찾기 = 해시 조회 O(1)', INFO], ['임베딩 학습 없이 바로 쓴다', GOOD], ['맞은 단어로 이유를 보여 준다', ACC]].forEach(([s, col], i) => {
        const y = 80 + i * 66, p = pop(u, 0.2 + i * 0.35); card(700, y, 420, 50, { rx: 10, stroke: col, sw: 2.2, fill: PANEL, s: p });
        tx(700, y + 6, s, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: clamp(p) }); });
      tx(490, 300, 'D6가 뽑힌 이유', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 1.4) });
      toks(490, 334, ['define', 'a', 'K8s', 'CRD', 'with', 'apiVersion', 'v1beta1'], { fs: 13.5, gap: 4, s: (i) => fade(u, 1.5 + i * 0.08, 0.2), style: (i, w) => (QT[3].includes(w) ? { fill: WARN, stroke: WARN, color: PANEL } : {}) });
      return; }
    [['법률 · 특허 · 의료', '정확한 용어가 곧 정답'], ['코드 · 로그 · 에러 메시지', '식별자를 그대로 찾는다'], ['신조어 · 제품명 · 모델명', 'GPT-5, Claude 4.5 …']].forEach(([a, s], i) => {
      const y = 90 + i * 90, p = pop(u, 0.2 + i * 0.4); card(700, y, 420, 70, { rx: 12, stroke: ACC, sw: 2.2, fill: ACCBG, s: p });
      tx(700, y - 4, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(p) }); tx(700, y + 20, s, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: clamp(p) }); }); }

  // ---------- 4. 토큰이 다르면 0점 ----------
  const CORP4 = [['machine', 'learning', 'model', 'accuracy'], ['차량', '시세', '정보'], ['accuracy', 'improvement', 'techniques']];
  function s4(t, c) { const { k, u } = c, b = c.beat, cs = b.cases || [], np = (c.prev && c.prev.cases) ? c.prev.cases.length : 0;
    if (k === 0) { tx(60, 60, '실험용 코퍼스 (문서 3개)', { 'font-size': 15, 'font-weight': 800 });
      CORP4.forEach((ws, i) => { const y = 110 + i * 56; tx(60, y + 5, 'D' + (i + 1), { 'font-size': 15, 'font-weight': 800, opacity: fade(u, 0.2 + i * 0.3) });
        toks(110, y, ws, { s: (j) => pop(u, 0.3 + i * 0.3 + j * 0.08) }); });
      banner(480, 330, 'BM25는 토큰이 똑같아야 점수를 준다', pop(u, 1.6)); return; }
    const cur = cs[cs.length - 1];
    if (!b.fix) { const isNew = cs.length > np;
      tx(40, 56, '질의', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(40, 146, '문서', { 'font-size': 14, fill: MUT, 'font-weight': 700 });
      const qx = toks(90, 52, cur.q.split(' '), { s: (j) => (isNew ? pop(u, 0.2 + j * 0.1) : 1), style: () => ({ stroke: WARN, fill: WARNBG }) });
      const dx = toks(90, 142, cur.d.split(' '), { s: (j) => (isNew ? pop(u, 0.5 + j * 0.1) : 1) });
      const mid = Math.min(Math.max(qx, dx), 560) / 2 + 45;
      pill(mid, 97, '겹치는 토큰 0개', BAD, pop(u, 1.0), { fs: 14, fill: BADBG });
      tx(620, 56, 'BM25', { 'font-size': 15, 'font-weight': 800 }); bar(690, 52, 170, 0, 1, { col: BAD, text: '0.0', tcol: BAD }); cross(640, 84, 7, pop(u, 1.2));
      tx(620, 146, 'Dense', { 'font-size': 15, 'font-weight': 800, fill: ACC }); const g = E(u, 1.2, 2.0); bar(690, 142, 170, cur.dense * g, 1, { text: (cur.dense * g).toFixed(2) });
      mono(780, 176, '예시 값', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }); }
    else { [['동의어 사전', '사람이 직접 매핑', WARN, false], ['어간 추출', '한국어는 형태소 분석 필요', WARN, false], ['Dense Retrieval', '의미 공간에서 비교', ACC, true]].forEach(([a, s, col, best], i) => {
        const x = 170 + i * 310, p = pop(u, 0.2 + i * 0.4); card(x, 110, 280, 84, { rx: 12, stroke: col, sw: best ? 3 : 2, fill: best ? ACCBG : PANEL, s: p });
        tx(x, 104, a, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'middle', fill: col, opacity: clamp(p) }); tx(x, 130, s, { 'font-size': 14, fill: MUT, 'text-anchor': 'middle', opacity: clamp(p) });
        pill(x, 160, best ? '근본 해법' : '부분 해법', col, p, { fs: 13.5, fill: PANEL }); }); }
    // 아래: 지금까지의 실패 목록
    tx(30, 240, '질의', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(210, 240, '문서', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    tx(560, 240, 'BM25', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 }); tx(650, 240, 'Dense(예시)', { 'font-size': 13.5, fill: MUT, 'font-weight': 700 });
    cs.forEach((r, i) => { const y = 270 + i * 36, a = i >= np ? fade(u, 1.6) : 1;
      el('line', { x1: 24, y1: y + 18, x2: 936, y2: y + 18, stroke: GRID, 'stroke-width': 1, opacity: a });
      tx(30, y + 5, r.q, { 'font-size': 14, 'font-weight': 700, opacity: a }); mono(210, y + 5, r.d, { 'font-size': 13.5, opacity: a });
      mono(560, y + 5, '0.0', { 'font-size': 14.5, 'font-weight': 800, fill: BAD, opacity: a }); mono(650, y + 5, r.dense.toFixed(2), { 'font-size': 14.5, 'font-weight': 800, fill: ACC, opacity: a });
      tx(930, y + 5, r.why, { 'font-size': 14, fill: MUT, 'text-anchor': 'end', opacity: a }); }); }

  // ---------- 5. 보완 관계 ----------
  function miniIndex(x, y, s) { if (s <= 0) return; [['XGBoost', 'D3 D4'], ['K8s', 'D6']].forEach(([w, d], i) => {
      mono(x, y + i * 26, w, { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'end', opacity: s }); mono(x + 10, y + i * 26, '→ ' + d, { 'font-size': 13.5, fill: MUT, opacity: s }); }); }
  function miniVec(x, y, s) { if (s <= 0) return; [[0, 0], [14, -10], [8, 14], [70, -40], [62, -26]].forEach(([dx, dy], i) => el('circle', { cx: x + dx, cy: y + dy, r: 5, fill: i < 3 ? ACC : INK, opacity: s }));
    el('line', { x1: x - 20, y1: y + 30, x2: x + 90, y2: y + 30, stroke: MUT, 'stroke-width': 1.5, opacity: s }); el('line', { x1: x - 20, y1: y + 30, x2: x - 20, y2: y - 56, stroke: MUT, 'stroke-width': 1.5, opacity: s }); }
  function s5(t, c) { const { k, u } = c, b = c.beat, T = b.table;
    if (k === 0) { const src = [['코드 · 로그 · 에러 검색', 0], ['FAQ 챗봇 (자연어)', 2], ['일반 RAG', 1], ['신규 도메인 즉시 시작', 0]];
      const bins = [['Sparse (BM25)', INK], ['Hybrid', ACC], ['Dense', INFO]];
      bins.forEach(([n, col], j) => card(780, 90 + j * 120, 220, 64, { rx: 32, text: n, fs: 18, fw: 800, color: j === 1 ? PANEL : col, fill: j === 1 ? ACC : PANEL, stroke: col, sw: 2.5, s: pop(u, 0.2 + j * 0.15) }));
      src.forEach(([n, to], i) => { const y = 70 + i * 84, s = pop(u, 0.4 + i * 0.3); card(180, y, 300, 52, { rx: 10, text: n, fs: 15, fw: 700, stroke: GRID, sw: 1.8, s });
        grow(332, y, 668, 90 + to * 120, E(u, 0.8 + i * 0.3, 1.4 + i * 0.3), to === 1 ? ACC : MUT, { sw: 2.2 });
        if (i === 3) grow(780, 124, 780, 176, E(u, 2.1, 2.5), ACC, { dash: '5 4' }); });
      tx(800, 154, '데이터가 모이면', { 'font-size': 13.5, fill: ACC, 'font-weight': 700, opacity: fade(u, 2.2) }); return; }
    if (k === 4) { const fs = [['가중합', 'final = 0.5·bm25 + 0.5·dense', '점수 스케일을 맞춰야 한다'], ['RRF', 'final = Σ 1 / (60 + rank)', '순위만 쓴다']];
      fs.forEach(([n, f, s], i) => { const y = 90 + i * 130, p = pop(u, 0.2 + i * 0.4); card(230, y, 420, 100, { rx: 12, stroke: i ? ACC : INFO, sw: 2.5, fill: PANEL, s: p });
        tx(40, y - 22, n, { 'font-size': 16, 'font-weight': 800, fill: i ? ACC : INFO, opacity: clamp(p) }); mono(40, y + 8, f, { 'font-size': 16, 'font-weight': 700, opacity: clamp(p) });
        tx(40, y + 34, s, { 'font-size': 14, fill: MUT, opacity: clamp(p) }); });
      tx(500, 44, 'RRF 점수 1/(60 + rank)', { 'font-size': 14, fill: MUT, 'font-weight': 700, opacity: fade(u, 0.9) });
      b.rrf.forEach((v, i) => { const y = 70 + i * 32, g = E(u, 1.0 + i * 0.1, 1.6 + i * 0.1);
        mono(500, y + 5, String(i + 1) + '위', { 'font-size': 14, fill: MUT, opacity: fade(u, 1.0 + i * 0.1) }); bar(550, y, 280, v * g, 0.0164, { h: 14, text: (v * g).toFixed(4) }); });
      tx(690, 404, '1위와 10위 차이가 크지 않다', { 'font-size': 14.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: fade(u, 2.2) }); return; }
    if (k === 6) { miniIndex(220, 110, fade(u, 0.2)); miniVec(680, 120, fade(u, 0.4));
      tx(170, 60, 'Sparse: 어떤 토큰?', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.2) }); tx(630, 60, 'Dense: 어떤 의미?', { 'font-size': 16, 'font-weight': 800, fill: INFO, opacity: fade(u, 0.4) });
      grow(240, 170, 440, 220, E(u, 0.7, 1.2), ACC); grow(700, 170, 520, 220, E(u, 0.7, 1.2), ACC);
      card(480, 240, 560, 52, { rx: 26, fill: ACC, stroke: 'none', text: 'Hybrid = α·BM25 + (1−α)·cos   또는   Σ 1/(60+rank)', fs: 15, fw: 800, color: PANEL, mono: true, s: pop(u, 1.2) });
      [['IV-1-3 Hybrid Search', '구현 패턴'], ['IV-2-1 Re-ranking', 'cross-encoder 재정렬']].forEach(([a, s], i) => { const x = 300 + i * 360, p = pop(u, 1.8 + i * 0.3);
        card(x, 340, 300, 60, { rx: 10, stroke: ACC, sw: 2, fill: ACCBG, s: p }); tx(x, 336, a, { 'font-size': 15.5, 'font-weight': 800, 'text-anchor': 'middle', opacity: clamp(p) }); tx(x, 356, s, { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle', opacity: clamp(p) }); });
      return; }
    // 비교 표
    const n = b.rows, pn = (c.prev && c.prev.rows) || 0;
    tx(30, 44, '관점', { 'font-size': 14, fill: MUT, 'font-weight': 700 }); tx(220, 44, 'Sparse (BM25)', { 'font-size': 15, 'font-weight': 800 }); tx(580, 44, 'Dense', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    el('line', { x1: 20, y1: 56, x2: 940, y2: 56, stroke: INK, 'stroke-width': 1.5 });
    T.slice(0, n).forEach(([a, sp, de], i) => { const y = 84 + i * 38, isNew = i >= pn, op = isNew ? fade(u, 0.2 + (i - pn) * 0.35, 0.4) : 1;
      const col = (s) => (s.startsWith('✓') ? GOOD : s.startsWith('✗') ? BAD : INK);
      if (isNew) el('rect', { x: 20, y: y - 18, width: 920 * E(u, 0.2 + (i - pn) * 0.35, 0.7 + (i - pn) * 0.35), height: 34, rx: 6, fill: WARNBG, opacity: 0.8 });
      tx(30, y + 5, a, { 'font-size': 14.5, 'font-weight': 800, opacity: op }); tx(220, y + 5, sp, { 'font-size': 14.5, fill: col(sp), 'font-weight': 600, opacity: op }); tx(580, y + 5, de, { 'font-size': 14.5, fill: col(de), 'font-weight': 600, opacity: op }); });
    if (k === 5) tx(480, 404, 'OpenAI file_search · Elasticsearch · OpenSearch · Weaviate는 둘을 함께 쓴다', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC, opacity: fade(u, 1.6) }); }

  const quiz = [
    { q: '문서 1000개 중 950개에 나오는 "the"의 TF-IDF가 낮은 이유는 무엇인가?',
      o: ['D3 안 등장 횟수가 적어서', '거의 모든 문서에 있어 IDF가 0.02로 작아서', '질의 단어가 아니라서 점수를 0으로 두어서'], a: 1,
      why: 'IDF = log10(1000/950) = 0.02라 TF가 15여도 0.33에 그친다. 5개 문서에만 있는 XGBoost는 IDF 2.30이다.' },
    { q: 'BM25에서 machine(TF 8)이 XGBoost(TF 3)보다 점수가 낮아진 까닭은 무엇인가?',
      o: ['k1 때문에 TF 부분이 2.5 근처에서 포화되어서', 'machine이 질의에서 첫 단어라서', '문서 길이 보정이 machine에만 적용되어서'], a: 0,
      why: 'TF 부분은 tf·(k1+1)/(tf+k1)이라 TF가 8이어도 2.11에 머문다. 남은 차이는 IDF가 정해 XGBoost 3.84, machine 1.94가 된다.' },
    { q: '"torch.nn.functional.softmax" 질의에 BM25가 D5만 찾아낸 방식은 무엇인가?',
      o: ['임베딩 벡터가 가장 가까운 문서를 골랐다', '파이썬 문법을 해석해 함수 이름을 찾았다', '역색인에서 같은 토큰이 든 문서 목록을 꺼냈다'], a: 2,
      why: '토큰 하나를 역색인에서 찾으면 그 단어가 든 문서 목록이 바로 나온다. D5만 그 토큰을 가져 1.835, 나머지는 0이다.' },
    { q: '"자동차 가격" 질의에 "차량 시세 정보" 문서가 BM25 0점을 받는 이유는 무엇인가?',
      o: ['한국어는 BM25로 색인할 수 없어서', '뜻은 같아도 겹치는 토큰이 하나도 없어서', '문서가 너무 짧아 길이 보정에 걸려서'], a: 1,
      why: 'BM25는 단어를 기호로만 본다. 자동차와 차량은 다른 토큰이라 점수가 0.0이고, 의미로 비교하는 Dense가 이 틈을 메운다.' },
    { q: 'RRF로 두 검색 결과를 합칠 때 쓰는 값은 무엇인가?',
      o: ['각 검색기가 매긴 순위', 'BM25 점수와 코사인 점수의 원래 값', '문서의 길이'], a: 0,
      why: 'RRF는 1/(60 + rank)를 더한다. 점수 스케일이 달라도 순위만 쓰므로 정규화가 필요 없다.' },
  ];

  const summary = [
    'TF-IDF는 문서 안 빈도와 희소성을 곱한다. 흔한 the는 0.33, 드문 XGBoost는 6.90이다.',
    'BM25는 TF가 커져도 점수가 포화되게 하고 긴 문서를 보정한다. XGBoost가 machine을 앞선다.',
    '역색인으로 같은 토큰이 든 문서를 바로 찾으니 코드·약어·제품명 검색에 강하다.',
    '동의어·오타·의역은 0점이라 Dense와 함께 쓰는 Hybrid가 보통의 RAG에 맞다.',
  ];
  const review = [
    { q: '사내 검색에 BM25만 썼더니 "에러 로그 ORA-00942"는 잘 찾는데 "DB 테이블이 없다는 오류" 질문은 못 찾는다. 먼저 할 일은?',
      o: ['k1을 1.5에서 2.0으로 올린다', '임베딩 기반 Dense 검색을 함께 붙인다', '불용어 "the"를 색인에서 뺀다'], a: 1,
      why: '풀어쓴 자연어 질문은 문서와 겹치는 토큰이 거의 없어 BM25가 0점을 준다. 의미로 비교하는 Dense를 더해 Hybrid로 만든다.' },
    { q: '문서 4개로 rank_bm25를 시험했더니 "XGBoost" 질의 점수가 전부 0이다. XGBoost는 그중 2개 문서에 있다. 원인은?',
      o: ['토큰화할 때 대소문자를 바꿔서', '문서 길이 보정 b가 너무 커서', '문서 절반에 나오는 단어라 IDF가 0이 되어서'], a: 2,
      why: 'rank_bm25의 IDF는 ln((N−n+0.5)/(n+0.5))라 4개 중 2개면 ln(1) = 0이다. 무관한 문서를 더해 8개로 만들면 IDF가 0.956이 된다.' },
    { q: '긴 매뉴얼 문서가 짧은 FAQ보다 늘 위에 뜬다. TF-IDF를 BM25로 바꾸면 무엇이 달라지나?',
      o: ['길이 보정으로 평균보다 긴 문서의 점수가 깎인다', '긴 문서는 색인에서 빠진다', '모든 문서의 점수가 같아진다'], a: 0,
      why: 'BM25는 |d|/avgdl로 분모를 키운다. 문서가 평균보다 2배 길면 XGBoost의 TF 부분이 1.67에서 1.33으로 내려간다.' },
  ];

  R.page({ title: '단어 색인으로 찾는 검색', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
