/* IV-2-1 Re-ranking — 장면 5개 (../../anim/engine.js 규칙을 따른다)
 * 문서 8건·점수는 페이지의 BI_TOP(biScore·crossScore·truth)과 STEPS.leftRows 를 읽는다.
 * 점수는 설명용 예시 값이다(실제 ms-marco cross-encoder 는 로짓을 돌려준다). recall 0.852·0.951 도 예시. */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone, cross, check, hbar, server } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, BADBG, GOOD, GOODBG, WARN, WARNBG, INFO, INFOBG } = C;

  const SHORT = { D07: '설치 가이드', D23: 'async 성능 벤치마크', D11: 'Python 3.12 asyncio', D34: 'FastAPI vs Django', D02: '비동기 라우터 최적화', D45: 'Flask → FastAPI 이전', D19: 'uvicorn worker 튜닝', D38: 'Depends 의존성 주입' };
  const DOCS = () => (typeof BI_TOP === 'undefined' ? [] : BI_TOP);            // bi 순위 그대로 8건
  const byCross = () => DOCS().slice().sort((a, b) => b.crossScore - a.crossScore);
  const QTXT = 'FastAPI 비동기 성능 최적화 방법';
  const note = (x, y, s, op, a) => tx(x, y, s, Object.assign({ 'font-size': 15, 'font-weight': 700, opacity: op ?? 1 }, a || {}));
  const hsh = (i) => { const s = Math.sin((i + 1) * 91.7) * 43758.5453; return s - Math.floor(s); };
  const f2 = (v) => v.toFixed(2);

  // 벡터 한 줄: n 칸 막대(높이는 고정 무늬), u 만큼 채워짐
  function vecStrip(x, y, n, u, col, seed, label) {
    for (let i = 0; i < n; i++) { const s = clamp(u * n - i); if (s <= 0) continue; const h = 6 + 22 * hsh(i + seed * 40);
      el('rect', { x: x + i * 7, y: y + 28 - h * s, width: 5, height: h * s, rx: 1.5, fill: col, opacity: 0.85 }); }
    el('line', { x1: x - 2, y1: y + 29, x2: x + n * 7, y2: y + 29, stroke: GRID, 'stroke-width': 1.5 });
    if (label) mono(x + n * 7 + 8, y + 24, label, { 'font-size': 14, fill: MUT, opacity: clamp(u * 2) }); }
  // 후보 행: 순위 동그라미 · id · 짧은 제목 · 점수
  function row(x, y, w, d, o) { o = o || {}; const op = o.op ?? 1, s = o.s ?? 1; if (s <= 0.02) return;
    const st = o.st || 'bi', col = st === 'cut' ? OFF : st === 'top' ? ACC : st === 'warn' ? BAD : INFO;
    const g = R.G(x + w / 2, y, s, op);
    el('rect', { x: -w / 2, y: -16, width: w, height: 32, rx: 7, fill: st === 'top' ? ACCBG : st === 'warn' ? BADBG : PANEL, stroke: st === 'cut' ? GRID : col, 'stroke-width': st === 'top' || st === 'warn' ? 2.2 : 1.5 }, g);
    el('circle', { cx: -w / 2 + 18, cy: 0, r: 12, fill: col }, g);
    tx(-w / 2 + 18, 5, String(o.rank ?? ''), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: PANEL, class: 'mono' }, g);
    tx(-w / 2 + 38, 5, d.id, { 'font-size': 13.5, class: 'mono', fill: MUT, 'font-weight': 700 }, g);
    tx(-w / 2 + 80, 5, SHORT[d.id], { 'font-size': 14, 'font-weight': 600, fill: st === 'cut' ? OFF : INK, 'text-decoration': st === 'cut' ? 'line-through' : null }, g);
    if (o.score != null) tx(w / 2 - 10, 5, o.score, { 'font-size': 14, 'font-weight': 700, class: 'mono', 'text-anchor': 'end', fill: st === 'cut' ? OFF : col }, g); }

  // ---------- 1. Bi-encoder ----------
  function encoder(cx, cy, op, label) { card(cx, cy, 150, 70, { rx: 12, stroke: INFO, fill: INFOBG, sw: 2.5, text: label || 'Bi-encoder\nMiniLM-L6', fs: 15, color: INFO, op }); }
  function fan(u, o) { o = o || {}; const ox = 70, oy = 352, L = 300, base = 0.70;   // 질의 벡터 방향(라디안, 위로)
    const P = (a, r) => [ox + Math.cos(a) * r, oy - Math.sin(a) * r];
    el('path', { d: `M${ox},${oy} L${ox + 330},${oy}`, stroke: GRID, 'stroke-width': 1.5 });
    [0.05, 0.14, 1.5, 1.62].forEach((a, i) => { const [x, y] = P(a, L * 0.82); el('line', { x1: ox, y1: oy, x2: lerp(ox, x, u), y2: lerp(oy, y, u), stroke: OFF, 'stroke-width': 1.5, opacity: 0.8 }); });
    DOCS().forEach((d, i) => { const ang = base + (i % 2 ? -1 : 1) * Math.acos(d.biScore), [x, y] = P(ang, L), g = clamp(u * 1.6 - i * 0.08);
      if (g <= 0) return; const hot = o.hot && o.hot(d), col = hot ? BAD : INFO;
      el('line', { x1: ox, y1: oy, x2: lerp(ox, x, g), y2: lerp(oy, y, g), stroke: col, 'stroke-width': hot ? 3 : 2, opacity: 0.85 });
      const [lx, ly] = P(ang, L + 22); if (g >= 1) mono(lx, ly + 5, d.id, { 'font-size': 13.5, fill: col, 'font-weight': 700, 'text-anchor': 'middle' }); });
    const [qx, qy] = P(base, L + 26); el('line', { x1: ox, y1: oy, x2: qx, y2: qy, stroke: ACC, 'stroke-width': 3.5, 'marker-end': 'url(#ra-ahb)' });
    tx(qx - 4, qy - 10, '질의', { 'font-size': 15, 'font-weight': 800, fill: ACC, 'text-anchor': 'end' });
    if (o.arc) { const a0 = base, a1 = base + Math.acos(DOCS()[0].biScore), r = 90, [x0, y0] = P(a0, r), [x1, y1] = P(a1, r);
      el('path', { d: `M${x0},${y0} A${r},${r} 0 0 0 ${x1},${y1}`, fill: 'none', stroke: INK, 'stroke-width': 2, opacity: o.arc });
      mono(ox + 104, oy - 76, `cos θ = ${f2(DOCS()[0].biScore)}`, { 'font-size': 14.5, 'font-weight': 700, opacity: o.arc }); } }
  function list8(x, y, u, o) { o = o || {}; DOCS().forEach((d, i) => row(x, y + i * 38, o.w || 420, d, { rank: i + 1, score: f2(d.biScore), s: o.anim ? pop(u, 0.3 + i * 0.12, 0.45) : 1, st: o.st ? o.st(d) : 'bi' })); }
  function s1(t, c) { const { k, u } = c;
    if (k <= 2) {
      encoder(400, 210, k === 0 ? pop(u, 0.2) : 1);
      if (k === 0) {
        pill(150, 120, QTXT, ACC, pop(u, 0.6), { fs: 14 }); card(150, 300, 190, 52, { rx: 8, stroke: INK, text: '문서 한 건', fs: 15, s: pop(u, 0.8) });
        grow(270, 132, 322, 190, E(u, 1.0, 1.4), ACC); grow(250, 292, 322, 232, E(u, 1.1, 1.5), MUT);
        vecStrip(520, 102, 32, E(u, 1.5, 2.2), ACC, 1, 'q 384'); vecStrip(520, 262, 32, E(u, 1.7, 2.4), INFO, 2, 'd 384');
        grow(477, 198, 515, 130, E(u, 1.4, 1.6), ACC, { plain: true }); grow(477, 222, 515, 284, E(u, 1.5, 1.7), INFO, { plain: true });
        note(400, 380, '같은 인코더 하나가 질의와 문서를 따로따로 벡터로 만든다', fade(u, 2.2), { 'text-anchor': 'middle' }); return; }
      if (k === 1) { for (let i = 0; i < 5; i++) card(120 - i * 4, 210 - i * 6, 130, 90, { rx: 6, stroke: GRID, fill: PANEL, sw: 1.5 });
        card(104, 186, 130, 90, { rx: 6, stroke: INK, text: 'docs\n1,000,000건', fs: 15 });
        for (let i = 0; i < 6; i++) dot([[180, 210], [324, 210]], ((u * 0.9 + i / 6) % 1), INFO, 5);
        const rows = Math.floor(E(u, 0.3, 2.2) * 10);
        for (let r = 0; r < 10; r++) for (let q = 0; q < 24; q++) if (r < rows) el('rect', { x: 520 + q * 13, y: 96 + r * 17, width: 11, height: 14, rx: 2, fill: INFO, opacity: 0.25 + 0.6 * hsh(r * 24 + q) });
        mono(520, 284, 'doc_vecs  (1,000,000 × 384)', { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 1.0) });
        R.dbIcon(860, 175, 'doc_vecs.npy', { s: pop(u, 1.8) * 0.8 });
        note(520, 340, '검색 전에 한 번만 계산해 둔다', fade(u, 2.1), { fill: GOOD }); return; }
      // k2 질의 인코딩
      card(104, 300, 130, 64, { rx: 6, stroke: GRID, text: 'doc_vecs\n미리 계산됨', fs: 14, color: MUT });
      pill(150, 110, QTXT, ACC, 1, { fs: 14 }); dot([[270, 120], [326, 190]], seg(u, 0.2, 0.9), ACC, 7);
      vecStrip(520, 180, 32, E(u, 0.9, 1.8), ACC, 1, 'q_vec 384');
      grow(477, 210, 515, 210, E(u, 0.8, 1.0), ACC, { plain: true });
      const n = u > 1.0 ? 1 : 0; mono(520, 290, `인코더 호출  ${n}회`, { 'font-size': 18, 'font-weight': 800, fill: ACC, opacity: fade(u, 1.0) });
      note(520, 330, '남은 일은 코사인 유사도 계산뿐', fade(u, 2.0)); return; }
    // k3~5: 코사인 부채꼴 + 후보 목록
    if (k === 5) { // 따로 인코딩 → 점곱
      pill(190, 70, QTXT, ACC, 1, { fs: 14 }); pill(190, 250, 'FastAPI 공식 튜토리얼 — 설치 가이드', INFO, 1, { fs: 14 });
      el('rect', { x: 190 - tw(QTXT, 14) / 2 - 2, y: 58, width: tw('FastAPI', 14) + 4, height: 24, rx: 4, fill: WARN, opacity: 0.3 * fade(u, 0.3) });
      el('rect', { x: 190 - tw('FastAPI 공식 튜토리얼 — 설치 가이드', 14) / 2 - 2, y: 238, width: tw('FastAPI', 14) + 4, height: 24, rx: 4, fill: WARN, opacity: 0.3 * fade(u, 0.3) });
      vecStrip(80, 105, 24, 1, ACC, 1); vecStrip(80, 285, 24, 1, INFO, 2);
      grow(250, 120, 330, 175, E(u, 0.6, 1.0), MUT); grow(250, 300, 330, 205, E(u, 0.6, 1.0), MUT);
      card(360, 190, 56, 56, { rx: 28, stroke: INK, text: '·', fs: 30, s: pop(u, 1.0) });
      mono(360, 250, '0.89', { 'font-size': 17, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.3) });
      note(40, 375, '서로 읽지 않고 숫자만 비교 → 단어만 겹쳐도 1위', fade(u, 1.6), { fill: BAD });
      list8(500, 70, u, { st: (d) => (d.truth === 'low' ? 'warn' : 'bi') });
      return; }
    fan(k === 3 ? E(u, 0.2, 1.4) : 1, { arc: k === 3 ? fade(u, 1.6) : 1, hot: k === 4 ? (d) => d.id === 'D07' : null });
    list8(500, 70, u, { anim: k === 3, st: k === 4 ? (d) => (d.id === 'D07' ? 'warn' : 'bi') : null });
    if (k === 3) { tx(500, 392, '1,000,000건 중 상위 50건 → 화면엔 8건', { 'font-size': 14.5, fill: MUT, opacity: fade(u, 1.8) }); }
    if (k === 4) { pill(720, 392, '질의 의도: 성능 최적화 ≠ 설치', BAD, pop(u, 0.8), { fs: 14 }); } }

  // ---------- 2. Cross-encoder ----------
  const TOK_Q = ['FastAPI', '비동기', '성능', '최적화'], TOK_D = ['FastAPI', '설치', '가이드'];
  function tokRow(x, y, u, o) { o = o || {}; const parts = ['[CLS]'].concat(TOK_Q, ['[SEP]'], TOK_D, ['[SEP]']), pos = []; let cx = x;
    parts.forEach((p, i) => { const w = tw(p, 14) + 16, sp = p[0] === '[', isQ = i >= 1 && i <= 4, s = clamp(u * parts.length - i);
      if (s > 0) card(cx + w / 2, y, w, 30, { rx: 6, text: p, fs: 14, fw: 700, mono: sp, stroke: sp ? OFF : isQ ? ACC : INFO, color: sp ? MUT : isQ ? ACC : INFO, fill: PANEL, s: 0.6 + 0.4 * s, op: s });
      pos.push(cx + w / 2); cx += w + 6; });
    return pos; }
  function s2(t, c) { const { k, u } = c, D = DOCS();
    if (k === 0) { const pos = tokRow(110, 80, E(u, 0.2, 1.4));
      card(480, 190, 520, 74, { rx: 12, stroke: ACC, fill: ACCBG, sw: 2.5, text: 'CrossEncoder  ms-marco-MiniLM-L-6-v2', fs: 16, color: ACC, s: pop(u, 1.3) });
      pos.forEach((x) => grow(x, 98, lerp(x, 480, 0.35), 150, E(u, 1.4, 1.8), GRID, { plain: true }));
      grow(480, 228, 480, 290, E(u, 1.8, 2.1), ACC); card(480, 318, 140, 46, { rx: 23, stroke: ACC, text: '점수 1개', fs: 16, color: ACC, s: pop(u, 2.1) });
      note(480, 386, '(질의, 문서) 쌍을 한 입력으로 같이 읽는다', fade(u, 2.3), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { D.forEach((d, i) => row(40, 60 + i * 38, 360, d, { rank: i + 1, score: f2(d.biScore), s: 1 }));
      el('path', { d: 'M470,60 L650,150 L650,250 L470,340 Z', fill: ACCBG, stroke: ACC, 'stroke-width': 2, opacity: fade(u, 0.3) });
      mono(560, 205, 'top-50', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.5) });
      for (let i = 0; i < 8; i++) dot([[410, 60 + i * 38], [470, 60 + i * 38], [650, 200]], seg(u, 0.4 + i * 0.12, 1.4 + i * 0.12), INFO, 6);
      card(800, 200, 200, 70, { rx: 12, stroke: ACC, sw: 2.5, text: 'Cross-encoder\nreranker', fs: 16, color: ACC, s: pop(u, 1.6) });
      note(480, 390, '100만 건 전체가 아니라 후보 50건에만 정밀 심사', fade(u, 2.0), { 'text-anchor': 'middle' }); return; }
    if (k === 2) { const n = Math.round(E(u, 0.2, 2.0) * 50);
      tx(60, 60, '(query, doc) 쌍 50개 → predict 한 번', { 'font-size': 16, 'font-weight': 800 });
      for (let i = 0; i < 50; i++) { const x = 60 + (i % 10) * 40, y = 84 + Math.floor(i / 10) * 40, on = i < n;
        el('rect', { x, y, width: 15, height: 28, rx: 3, fill: on ? ACC : PANEL, stroke: on ? 'none' : GRID }); el('rect', { x: x + 17, y, width: 15, height: 28, rx: 3, fill: on ? INFO : PANEL, stroke: on ? 'none' : GRID }); }
      mono(60, 310, `forward  ${n} / 50`, { 'font-size': 20, 'font-weight': 800, fill: ACC });
      tx(540, 90, '같은 질의 하나에 드는 모델 추론 횟수', { 'font-size': 15, 'font-weight': 700, fill: MUT, opacity: fade(u, 0.6) });
      [['Bi (질의 인코딩)', 1, INFO], ['Cross (쌍마다)', 50, ACC]].forEach(([nm, v, col], i) => { const y = 130 + i * 70;
        tx(540, y, nm, { 'font-size': 15, 'font-weight': 700, opacity: fade(u, 0.8 + i * 0.4) });
        hbar(540, y + 12, 300, v, 50, { col, u: E(u, 0.9 + i * 0.4, 1.8 + i * 0.4), text: v + '회' }); });
      note(540, 300, '추론이 50배 많다 → 그래서 느리다', fade(u, 2.1), { fill: BAD }); return; }
    if (k === 3) { const ax = R.axes(260, 50, 560, 300, { x: [0, 1], y: [0, 8], xt: [0, 0.5, 1], yt: [], xl: '점수 (예시)' });
      D.forEach((d, i) => { const y = 72 + i * 37, g = E(u, 0.3 + i * 0.15, 1.1 + i * 0.15), up = d.crossScore > d.biScore, col = up ? GOOD : BAD;
        tx(250, y + 5, d.id + ' ' + SHORT[d.id], { 'font-size': 13.5, 'text-anchor': 'end', 'font-weight': 600 });
        el('circle', { cx: ax.X(d.biScore), cy: y, r: 6, fill: INFO });
        if (g > 0) { el('line', { x1: ax.X(d.biScore), y1: y, x2: ax.X(lerp(d.biScore, d.crossScore, g)), y2: y, stroke: col, 'stroke-width': 2.5, 'marker-end': g > 0.97 ? (up ? null : 'url(#ra-ahr)') : null });
          el('circle', { cx: ax.X(lerp(d.biScore, d.crossScore, g)), cy: y, r: 6, fill: ACC }); }
        if (g >= 1 && (d.id === 'D07' || d.id === 'D02')) mono(ax.X(d.crossScore) + (up ? 12 : -12), y - 9, `${f2(d.biScore)}→${f2(d.crossScore)}`, { 'font-size': 14, 'font-weight': 800, fill: col, 'text-anchor': up ? 'start' : 'end' }); });
      el('circle', { cx: 846, cy: 30, r: 6, fill: INFO }); tx(858, 35, 'bi', { 'font-size': 14 }); el('circle', { cx: 896, cy: 30, r: 6, fill: ACC }); tx(908, 35, 'cross', { 'font-size': 14 });
      return; }
    if (k === 4) { zone(30, 40, 400, 330, 'Bi-encoder: 따로 읽고 사후 비교', { color: INFO });
      pill(150, 110, '성능 최적화', ACC, 1, { fs: 14 }); pill(150, 250, '설치 가이드', INFO, 1, { fs: 14 });
      vecStrip(240, 86, 16, 1, ACC, 1); vecStrip(240, 226, 16, 1, INFO, 2);
      card(330, 180, 48, 48, { rx: 24, text: '·', fs: 28, s: pop(u, 0.4) }); grow(320, 130, 330, 154, 1, MUT, { plain: true }); grow(320, 236, 330, 206, 1, MUT, { plain: true });
      sub(230, 340, '두 벡터가 만나는 건 마지막 점곱 한 번', fade(u, 0.6), { 'font-size': 14.5 });
      zone(470, 40, 460, 330, 'Cross-encoder: 한 입력에서 서로 주목', { color: ACC });
      const xs = [530, 610, 690, 790, 870], words = ['성능', '최적화', '[SEP]', '설치', '가이드'];
      words.forEach((w, i) => card(xs[i], 270, tw(w, 14) + 18, 30, { rx: 6, text: w, fs: 14, mono: w[0] === '[', stroke: i < 2 ? ACC : i > 2 ? INFO : OFF, color: i < 2 ? ACC : i > 2 ? INFO : MUT }));
      [[0, 3], [1, 4], [0, 4], [1, 3]].forEach(([a, b], j) => { const g = E(u, 0.6 + j * 0.3, 1.2 + j * 0.3); if (g <= 0) return; const x0 = xs[a], x1 = xs[b], h = 60 + j * 22;
        el('path', { d: `M${x0},252 C${x0},${252 - h} ${x1},${252 - h} ${x1},252`, fill: 'none', stroke: j < 2 ? BAD : WARN, 'stroke-width': 2.2, 'stroke-dasharray': `${g * 400} 400` }); });
      note(700, 340, '의도가 다르다는 걸 직접 본다', fade(u, 2.0), { 'text-anchor': 'middle', fill: BAD }); return; }
    // k5 trade-off: 깔때기
    const st = [['전체 문서', '1,000,000', INK, 520], ['Bi top-50', '50', INFO, 300], ['Cross top-5', '5', ACC, 120]];
    st.forEach(([nm, n, col, w], i) => { const y = 90 + i * 100, s = pop(u, 0.2 + i * 0.4);
      card(300, y, w, 60, { rx: 10, stroke: col, sw: 2.5, fill: i === 2 ? ACCBG : PANEL, s }); tx(300, y - 4, nm, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, opacity: s });
      mono(300, y + 18, n, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, opacity: s }); if (i) grow(300, y - 70, 300, y - 32, E(u, 0.1 + i * 0.4, 0.4 + i * 0.4), MUT); });
    sub(470, 195, 'ms 단위', fade(u, 0.9), { 'font-size': 14.5, fill: INFO, 'text-anchor': 'start' }); sub(400, 295, '+50~200ms', fade(u, 1.3), { 'font-size': 14.5, fill: ACC, 'text-anchor': 'start' });
    card(760, 140, 300, 70, { rx: 10, stroke: GOOD, sw: 2, text: '정확도  +5~15%p', fs: 18, color: GOOD, s: pop(u, 1.6) });
    card(760, 250, 300, 70, { rx: 10, stroke: WARN, sw: 2, text: '지연  +50~200ms', fs: 18, color: WARN, s: pop(u, 1.9) });
    note(760, 350, '후보 50건에만 쓰면 둘 다 감당된다', fade(u, 2.2), { 'text-anchor': 'middle' }); }

  // ---------- 3. 재정렬 ----------
  const LX = 40, RX = 510, RW = 370, RY = 70, RH = 40;
  function s3(t, c) { const { k, u } = c, D = DOCS(), CR = byCross();
    tx(LX, 44, 'Bi 순위', { 'font-size': 15, 'font-weight': 800, fill: INFO });
    if (k === 0) { D.forEach((d, i) => row(LX, RY + i * RH, RW, d, { rank: i + 1, score: f2(d.biScore) }));
      card(720, 160, 300, 100, { rx: 12, stroke: ACC, sw: 2.5, text: 'rerank(query,\n  candidates, top_k=5)', fs: 15, mono: true, color: ACC, s: pop(u, 0.3) });
      note(720, 250, '후보를 받아 다시 줄 세우는 함수', fade(u, 1.0), { 'text-anchor': 'middle' }); return; }
    if (k === 1) { D.forEach((d, i) => { row(LX, RY + i * RH, RW, d, { rank: i + 1, score: f2(d.biScore) }); const g = E(u, 0.3 + i * 0.15, 1.1 + i * 0.15);
        hbar(RX + 40, RY + i * RH - 8, 260, d.crossScore, 1, { u: g, col: ACC, text: 'cross ' + f2(d.crossScore), label: g > 0.9 }); });
      tx(RX + 40, 44, 'cross_scores (50건 중 8건)', { 'font-size': 15, 'font-weight': 800, fill: ACC, opacity: fade(u, 0.2) }); return; }
    tx(RX, 44, 'Cross 순위', { 'font-size': 15, 'font-weight': 800, fill: ACC });
    D.forEach((d, i) => row(LX, RY + i * RH, RW, d, { rank: i + 1, score: f2(d.biScore), op: 0.45, st: k >= 5 && d.truth === 'low' ? 'warn' : 'bi' }));
    CR.forEach((d, j) => { const i = D.indexOf(d), mv = k === 2 ? E(u, 0.3 + j * 0.12, 1.5 + j * 0.12) : 1;
      const y = lerp(RY + i * RH, RY + j * RH, mv), x = lerp(RX - 70, RX, mv), cut = k >= 3 && j >= 5, top = k >= 4 && j < 3;
      if (mv > 0.05) el('line', { x1: LX + RW, y1: RY + i * RH, x2: x, y2: y, stroke: cut ? OFF : i > j ? GOOD : i < j ? BAD : MUT, 'stroke-width': 2, opacity: 0.7 });
      if (mv > 0.02) row(x, y, RW, d, { rank: j + 1, score: f2(d.crossScore), st: cut ? 'cut' : top ? 'top' : k >= 5 && d.truth === 'low' ? 'warn' : 'bi', op: clamp(mv * 1.5) });
      if (k >= 2 && mv >= 1 && i !== j) { const dv = i - j; pill(RX + RW + 26, y, (dv > 0 ? '+' : '') + dv, dv > 0 ? GOOD : BAD, k === 2 ? pop(u, 1.6 + j * 0.05) : 1, { fs: 13.5, mono: true, fill: PANEL }); }
      if (cut && k === 3) pill(RX - 36, y, 'CUT', OFF, pop(u, 0.6 + (j - 5) * 0.2), { fs: 13.5, fill: PANEL }); });
    if (k >= 3) { const y = RY + 4.5 * RH, g = k === 3 ? E(u, 0.2, 0.8) : 1; el('line', { x1: RX - 10, y1: y, x2: lerp(RX - 10, RX + RW + 10, g), y2: y, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' });
      tx(RX - 14, y - 6, 'top_k=5', { 'font-size': 14, 'font-weight': 700, fill: BAD, class: 'mono', 'text-anchor': 'end', opacity: g > 0.95 ? 1 : 0 }); }
    if (k === 4) note(RX, 400, '1~3위 cross 0.96 · 0.94 · 0.91 = 진짜 관련 문서', fade(u, 0.8), { fill: ACC });
    if (k === 5) note(LX, 400, 'Bi 1·6·8위였던 오탐 3건이 전부 5위 밖', fade(u, 0.6), { fill: BAD }); }

  // ---------- 4. Cohere · BGE ----------
  function top5(x, y, w) { byCross().slice(0, 5).forEach((d, j) => row(x, y + j * 38, w, d, { rank: j + 1, st: 'top', score: f2(d.crossScore) })); tx(x, y - 28, '확정된 top-5', { 'font-size': 15, 'font-weight': 800, fill: ACC }); }
  function cloud(cx, cy, s, label) { const g = R.G(cx, cy, s);
    el('path', { d: 'M-70,25 Q-95,25 -92,0 Q-90,-28 -58,-26 Q-48,-55 -10,-50 Q20,-68 45,-40 Q85,-45 88,-8 Q105,10 85,25 Z', fill: INFOBG, stroke: INFO, 'stroke-width': 2.5 }, g);
    tx(0, 4, label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: INFO }, g); }
  function s4(t, c) { const { k, u } = c;
    top5(30, 110, 300);
    el('rect', { x: 370, y: 40, width: 300, height: 350, rx: 14, fill: 'none', stroke: MUT, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
    tx(384, 64, '우리 회사 안', { 'font-size': 14, 'font-weight': 700, fill: MUT });
    server(470, 150, '앱 서버', {});
    if (k <= 2) { const cs = k === 0 ? pop(u, 0.3) : 1; cloud(820, 150, cs, 'Cohere API');
      sub(820, 210, 'rerank-multilingual-v3.0', cs, { 'font-size': 14, fill: INFO, class: 'mono' });
      if (k === 0) card(520, 300, 250, 50, { rx: 8, stroke: INK, text: 'co = cohere.Client(...)', fs: 14.5, mono: true, s: pop(u, 0.8) });
      if (k === 1) { fly(530, 140, 730, 140, seg(u, 0.2, 1.2), '문서 50건 →', { fill: INFO }); fly(730, 175, 530, 175, seg(u, 1.4, 2.3), '← top_n=5', { fill: ACC, stay: true });
        mono(520, 300, 'HTTP 1회로 재정렬', { 'font-size': 16, 'font-weight': 800, fill: ACC, opacity: fade(u, 2.2), 'text-anchor': 'middle' }); }
      if (k === 2) { pill(820, 280, '약 $0.001 / 쿼리 (2024)', INK, pop(u, 0.3), { fs: 14.5 });
        fly(560, 220, 860, 340, seg(u, 0.9, 2.0), '사내 문서', { fill: BAD, stay: true });
        tx(520, 340, '데이터가 회사 밖으로 나간다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
        cross(686, 280, 10, pop(u, 1.6)); }
      return; }
    // BGE: 사내 GPU
    const gs = k === 3 ? pop(u, 0.2) : 1, gx = 560, gy = 270;
    const g = R.G(gx, gy, gs); el('rect', { x: -80, y: -40, width: 160, height: 80, rx: 8, fill: GOODBG, stroke: GOOD, 'stroke-width': 2.5 }, g);
    for (let i = 0; i < 6; i++) el('rect', { x: -66 + i * 22, y: -26, width: 14, height: 34, rx: 2, fill: GOOD, opacity: 0.5 }, g);
    tx(0, 30, 'GPU', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: GOOD }, g);
    if (k === 3) { card(800, 200, 230, 110, { rx: 12, stroke: GOOD, sw: 2, text: 'bge-reranker-v2-m3\n파라미터 568M\nuse_fp16=True', fs: 15, s: pop(u, 0.8) });
      grow(684, 220, 645, 255, E(u, 1.2, 1.5), GOOD); note(800, 300, 'BAAI 공개 모델, GPU 1장', fade(u, 1.6), { 'text-anchor': 'middle' }); }
    if (k === 4) { for (let i = 0; i < 6; i++) dot([[528, 165], [555, 238]], ((u * 0.8 + i / 6) % 1), GOOD, 5);
      mono(800, 200, 'compute_score(pairs)', { 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 0.3) });
      R.clock(800, 270, 30, E(u, 0.6, 1.8), GOOD); mono(800, 330, '50건 ~50ms', { 'font-size': 17, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.6) });
      note(520, 372, '데이터는 벽 안에 머문다', fade(u, 2.0), { 'text-anchor': 'middle', fill: GOOD }); }
    if (k === 5) { [['트래픽 작고 빨리 시작', 'Cohere', INFO], ['대용량·규제·예산', 'BGE 사내', GOOD]].forEach(([a, b, col], i) => { const y = 130 + i * 90, s = pop(u, 0.2 + i * 0.4);
        card(830, y, 220, 64, { rx: 10, stroke: col, sw: 2, text: a + '\n→ ' + b, fs: 15, s }); });
      grow(330, 400, 820, 400, E(u, 1.2, 2.0), ACC); pill(840, 362, 'LLM 컨텍스트', ACC, pop(u, 2.0), { fs: 14.5 }); } }

  // ---------- 5. 평가 ----------
  function s5(t, c) { const { k, u } = c, D = DOCS(), CR = byCross(), gold = new Set(D.filter((d) => d.truth === 'high').map((d) => d.id));
    if (k <= 1) { tx(40, 50, 'recall_at_k: top-k 안에 정답이 있으면 hit', { 'font-size': 17, 'font-weight': 800 });
      const lists = [['Bi top-5', D.slice(0, 5), INFO], ['Rerank top-5', CR.slice(0, 5), ACC]];
      lists.forEach(([nm, arr, col], li) => { const x = 60 + li * 440, y0 = 100; if (k === 0 && li === 1) return;
        tx(x, y0 - 12, nm, { 'font-size': 15, 'font-weight': 800, fill: col });
        arr.forEach((d, j) => { const s = k === 0 ? pop(u, 0.3 + j * 0.15) : li === 1 ? pop(u, 0.2 + j * 0.12) : 1, isG = gold.has(d.id);
          card(x + 70, y0 + 20 + j * 40, 140, 32, { rx: 6, text: d.id, fs: 14.5, mono: true, stroke: isG ? GOOD : GRID, fill: isG ? GOODBG : PANEL, s }); });
        const hit = arr.filter((d) => gold.has(d.id)).length, show = k === 0 ? fade(u, 1.4) : li === 1 ? fade(u, 1.0) : 1;
        tx(x + 160, y0 + 60, '정답 ' + hit + ' / ' + gold.size, { 'font-size': 16, 'font-weight': 800, fill: GOOD, opacity: show });
        mono(x + 160, y0 + 90, 'hit = 1', { 'font-size': 16, 'font-weight': 700, opacity: show }); check(x + 260, y0 + 84, 10, show);
        mono(x + 160, y0 + 120, '|정답∩top-5|/|정답| = ' + (hit / gold.size).toFixed(2), { 'font-size': 14, fill: MUT, opacity: show }); });
      sub(480, 350, '정답(초록) = 이 장 예시에서 관련도 high 인 D23 · D02 · D19', k === 0 ? fade(u, 1.8) : 1, { 'font-size': 14.5 });
      if (k === 1) note(480, 392, 'recall@k = hit 난 질의 수 / 전체 질의 수', fade(u, 1.6), { 'text-anchor': 'middle', fill: ACC });
      return; }
    const bars = (b, cr, opB, opC) => { tx(60, 120, 'Bi 단독', { 'font-size': 16, 'font-weight': 700, opacity: opB }); tx(60, 200, 'Bi + Cross rerank', { 'font-size': 16, 'font-weight': 700, opacity: opC });
      if (opB > 0) hbar(250, 104, 520, b, 1, { h: 26, col: INFO, text: b.toFixed(3) }); if (opC > 0) hbar(250, 184, 520, cr, 1, { h: 26, col: ACC, text: cr.toFixed(3) });
      tx(250, 80, 'recall@5 (MS MARCO dev, 예시 수치)', { 'font-size': 14.5, fill: MUT, 'font-weight': 600 }); };
    if (k === 2) { for (let i = 0; i < 7; i++) card(200 + i * 8, 200 - i * 8, 220, 110, { rx: 8, stroke: GRID, fill: PANEL, sw: 1.5 });
      card(248, 152, 220, 110, { rx: 8, stroke: INK, text: 'MS MARCO dev', fs: 16 });
      mono(600, 170, Math.round(E(u, 0.3, 1.8) * 6980).toLocaleString('en-US') + ' 쿼리', { 'font-size': 26, 'font-weight': 800 });
      tx(600, 215, '쿼리마다 정답 문서 표가 붙어 있다', { 'font-size': 15, fill: MUT, opacity: fade(u, 1.4) });
      note(600, 260, '같은 셋으로 두 방식을 잰다', fade(u, 2.0), { fill: ACC }); return; }
    if (k === 3) { bars(0.852 * E(u, 0.3, 1.6), 0, 1, 0); note(250, 270, '100번 중 약 15번은 top-5에 정답이 없다', fade(u, 1.8), { fill: BAD }); return; }
    if (k === 4) { bars(0.852, 0.951 * E(u, 0.3, 1.6), 1, 1); pill(860, 197, '+9.9%p', GOOD, pop(u, 1.8), { mono: true, fs: 15 }); return; }
    if (k === 5) { const miss = (n, x, lab, col, s) => { tx(x, 66, lab, { 'font-size': 15, 'font-weight': 800, fill: col });
        for (let i = 0; i < 100; i++) { const r = Math.floor(i / 10), q = i % 10, bad = i >= 100 - n * s; el('circle', { cx: x + 10 + q * 26, cy: 96 + r * 26, r: 9, fill: bad ? BAD : GOODBG, stroke: bad ? 'none' : GOOD, 'stroke-width': 1.2 }); } };
      miss(15, 60, 'Bi 단독: 정답 누락 14.8%', BAD, 1); miss(5, 520, 'rerank: 정답 누락 4.9%', ACC, E(u, 0.3, 1.6) * 0.67 + 0.33);
      note(480, 385, '누락이 약 1/3로 → 근거 없는 답(환각)도 줄어든다', fade(u, 1.8), { 'text-anchor': 'middle' }); return; }
    // k6 실무 파이프라인
    const st = [['질문', ''], ['임베딩', ''], ['vector DB', 'top-50'], ['cross-encoder', 'top-5'], ['LLM', '답변']];
    st.forEach(([a, b], i) => { const x = 100 + i * 190, s = pop(u, 0.2 + i * 0.3); card(x, 200, 150, 76, { rx: 12, stroke: i === 3 ? ACC : INK, fill: i === 3 ? ACCBG : PANEL, sw: i === 3 ? 2.8 : 2, text: b ? a + '\n' + b : a, fs: 15, color: i === 3 ? ACC : INK, s });
      if (i) grow(x - 115, 200, x - 77, 200, E(u, 0.1 + i * 0.3, 0.4 + i * 0.3), MUT); });
    note(480, 300, '대부분의 RAG 파이프라인에 그대로 얹는 4단 구조', fade(u, 1.8), { 'text-anchor': 'middle' }); }

  const quiz = [
    { q: 'Bi-encoder 검색이 100만 문서에서도 빠른 이유는 무엇인가?',
      o: ['문서 벡터를 미리 계산해 두고, 검색 때는 질의만 한 번 인코딩하기 때문이다', '문서를 50건만 읽기 때문이다', 'Cross-encoder보다 모델이 커서 한 번에 많이 읽기 때문이다'], a: 0,
      why: '문서 1,000,000 × 384 벡터는 인덱싱 때 한 번 만들어 둔다. 검색 시점에는 질의 인코딩 1회와 코사인 계산만 남는다.' },
    { q: 'Cross-encoder를 후보 50건에만 쓰는 이유는 무엇인가?',
      o: ['50건이 넘으면 점수가 0이 되기 때문이다', '(질의, 문서) 쌍마다 추론을 한 번씩 해야 해서 전체 문서에 쓰기엔 너무 느리기 때문이다', '문서 벡터를 저장할 공간이 없기 때문이다'], a: 1,
      why: '쌍 50개면 추론 50회다. 정확도는 오르지만 지연이 50~200ms 늘어나므로 1차 후보에만 건다.' },
    { q: '재정렬 뒤 Bi 1위였던 D07(설치 가이드)은 어떻게 되었나?',
      o: ['그대로 1위다', '2위로 한 칸 내려갔다', 'cross 0.31로 7위가 되어 top-5 밖으로 잘렸다'], a: 2,
      why: 'cross 점수 0.31은 8건 중 7번째다. 키워드만 겹친 오탐이라 top_k=5 컷에서 빠진다.' },
    { q: '사내 규제 때문에 문서를 밖으로 보낼 수 없을 때 맞는 선택은 무엇인가?',
      o: ['BGE Reranker를 사내 GPU에 띄운다', 'Cohere Rerank API를 쓴다', '재정렬을 빼고 Bi 순위를 쓴다'], a: 0,
      why: 'Cohere는 HTTP로 문서를 외부에 보낸다. bge-reranker-v2-m3는 GPU 1장에서 50건을 약 50ms에 처리하고 데이터가 회사 안에 머문다.' },
    { q: '이 장 코드의 recall_at_k는 질의 하나를 언제 hit로 세는가?',
      o: ['top-k가 모두 정답일 때', 'top-k 안에 정답이 하나라도 있을 때', '1위가 정답일 때만'], a: 1,
      why: 'any(r in relevant[q] for r in retrieved)로 판정한다. hit 난 질의 수를 전체 질의 수로 나눈 값이 recall@k다.' },
  ];
  const summary = [
    'Bi-encoder는 질의와 문서를 따로 벡터로 만들어 빠르지만, 단어만 겹친 문서를 1위에 올리기도 한다.',
    'Cross-encoder는 질의와 문서를 한 입력으로 같이 읽어 의도 차이를 잡는 대신 쌍마다 추론이 든다.',
    '그래서 Bi로 50건을 먼저 뽑고 Cross로 다시 줄 세워 5건만 남긴다. 오탐 3건이 모두 5위 밖으로 빠졌다.',
    '예시 수치로 recall@5가 0.852에서 0.951로 오르고, 지연은 50~200ms 늘어난다.',
  ];
  const review = [
    { q: '재정렬을 붙였더니 답은 좋아졌는데 응답이 2초 넘게 느려졌다. 먼저 의심할 것은?',
      o: ['Bi-encoder 인덱스가 오래되었다', 'Cross-encoder에 후보를 너무 많이 넘기고 있다', 'top_k를 5로 둔 것'], a: 1,
      why: 'Cross-encoder 비용은 넘긴 쌍 수에 비례한다. 50건 기준 50~200ms이니 수천 건을 넘기면 금방 초 단위가 된다.' },
    { q: 'Bi 순위 1위 문서가 질문과 키워드만 같고 내용은 엉뚱하다. 가장 알맞은 처방은?',
      o: ['임베딩 차원을 384에서 더 줄인다', '후보 수를 5건으로 줄인다', '상위 후보를 Cross-encoder로 다시 채점해 순서를 바꾼다'], a: 2,
      why: '따로 인코딩한 벡터의 점곱은 단어 겹침에 끌려간다. 쌍을 같이 읽는 재정렬이 D07을 0.89에서 0.31로 끌어내렸다.' },
    { q: '재정렬 효과를 재려고 한다. 공정한 비교 방법은?',
      o: ['같은 평가 셋에서 Bi 단독과 Bi+rerank의 recall@5를 각각 잰다', '재정렬 쪽만 새 질의로 잰다', '눈으로 본 상위 3건이 좋아 보이면 된다'], a: 0,
      why: '쿼리와 정답 표가 같아야 차이가 방식에서 나온다. 이 장은 MS MARCO dev 한 셋으로 두 파이프라인을 쟀다.' },
  ];

  R.page({ title: 'Re-ranking 2단 심사', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
