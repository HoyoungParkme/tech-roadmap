/* IV-2-1 인덱싱 — IVFFlat vs HNSW, 장면 5개 (../../anim/engine.js 규칙을 따른다) */
(function () {
  const R = window.RA, { C, el, tx, E, lerp, clamp, seg, pop, fade, tw, tween, card, mono, sub, lbl, pill, banner, grow, fly, dot, zone,
    cross, check, snippet, axes, line, scatter, hbar, meters } = R;
  const { INK, MUT, OFF, GRID, SOFT, PANEL, ACC, ACCBG, BAD, GOOD, WARN, INFO } = C;

  // ---------- 데이터: 고정 시드 점 + 실제 k-means (그림용 축약, 한 점 = 많은 행) ----------
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const BLOB = [[140, 120], [330, 100], [450, 230], [190, 300], [330, 330], [270, 210]];
  const P = []; BLOB.forEach(([bx, by]) => { for (let i = 0; i < 22; i++) P.push([clamp(bx + gauss() * 42, 60, 510), clamp(by + gauss() * 36, 60, 385)]); });
  const K = 6, d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  const assign = (cs) => P.map((p) => cs.reduce((bi, c, i) => (d2(p, c) < d2(p, cs[bi]) ? i : bi), 0));
  const HIST = [[[100, 112], [480, 100], [120, 370], [500, 370], [300, 90], [290, 250]]];   // 일부러 엉뚱한 시작점
  for (let it = 0; it < 10; it++) { const cs = HIST[HIST.length - 1], a = assign(cs);
    HIST.push(cs.map((c, j) => { const m = P.filter((_, i) => a[i] === j); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; })); }
  const CEN = HIST[HIST.length - 1], LAB = assign(CEN);
  const CCOL = [ACC, INFO, WARN, GOOD, BAD, INK];
  // 질의: 두 구역 경계 근처
  const ord0 = CEN.map((c, j) => [d2(c, CEN[5]), j]).sort((a, b) => a[0] - b[0]);
  const Q = [lerp(CEN[5][0], CEN[ord0[1][1]][0], 0.49), lerp(CEN[5][1], CEN[ord0[1][1]][1], 0.49) - 6];
  const CORD = CEN.map((c, j) => [d2(c, Q), j]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);   // 가까운 구역 순서
  const TRUE10 = P.map((p, i) => [d2(p, Q), i]).sort((a, b) => a[0] - b[0]).slice(0, 10).map((x) => x[1]);

  function star(x, y, s, col) { if (s <= 0) return; const p = []; for (let i = 0; i < 10; i++) { const r = (i % 2 ? 6 : 14) * s, a = -Math.PI / 2 + i * Math.PI / 5; p.push([x + r * Math.cos(a), y + r * Math.sin(a)].join(',')); }
    el('polygon', { points: p.join(' '), fill: col || BAD, stroke: PANEL, 'stroke-width': 1.5 }); }
  function xmark(x, y, s, col) { if (s <= 0) return; el('path', { d: `M${x - 9 * s},${y - 9 * s} L${x + 9 * s},${y + 9 * s} M${x + 9 * s},${y - 9 * s} L${x - 9 * s},${y + 9 * s}`, stroke: col || INK, 'stroke-width': 4, 'stroke-linecap': 'round' }); }
  function frame(title) { zone(40, 40, 490, 360, title, { fill: 'var(--soft)' }); }

  // 1. Sequential Scan — 100만 행을 전부 읽는다
  function s1(t, c) { const { k, u } = c;
    const cols = 25, rows = 10, frac = k === 0 ? 0 : k === 1 ? 0.4 * E(u, 0.1, 2.4) : k === 2 ? lerp(0.4, 1, E(u, 0.1, 1.6)) : 1;
    tx(40, 58, '한 점 = 4,000행 · 100만 행', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
    for (let i = 0; i < cols * rows; i++) { const x = 52 + (i % cols) * 19, y = 82 + Math.floor(i / cols) * 22, read = i < frac * cols * rows;
      el('rect', { x, y, width: 14, height: 15, rx: 3, fill: read ? WARN : OFF, opacity: read ? 0.85 : 0.5 }); }
    if (k === 1 || k === 2) { const i = Math.floor(frac * cols * rows) % (cols * rows); el('rect', { x: 50 + (i % cols) * 19, y: 80 + Math.floor(i / cols) * 22, width: 18, height: 19, rx: 3, fill: 'none', stroke: BAD, 'stroke-width': 2.5 }); }
    const readRows = Math.round(frac * 1000000);
    mono(52, 330, `읽은 행 ${readRows.toLocaleString('en-US')} / 1,000,000`, { 'font-size': 16, 'font-weight': 800, fill: k >= 2 ? BAD : INK });
    if (k === 0) { star(740, 110, pop(u, 0.2), BAD); mono(762, 116, '$1 (1536차원)', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
      snippet(570, 160, ['EXPLAIN ANALYZE', 'SELECT id, content', 'FROM items', 'ORDER BY embedding <=> $1', 'LIMIT 10;'], { fs: 14.5, op: fade(u, 0.6) });
      sub(720, 340, '인덱스가 없으니 길은 하나뿐', fade(u, 1.6), { 'font-size': 15, 'font-weight': 700, fill: INK }); return; }
    if (k === 1) { tx(740, 150, 'B-tree 는 거리 정렬에 못 쓴다', { 'font-size': 15, 'font-weight': 700, fill: BAD, 'text-anchor': 'middle', opacity: fade(u, 0.4) });
      mono(740, 200, 'embedding <=> $1', { 'font-size': 18, 'font-weight': 800, fill: ACC, 'text-anchor': 'middle', opacity: fade(u, 0.8) });
      sub(740, 232, '행마다 1536차원 거리 계산', fade(u, 1.2)); return; }
    if (k === 2) { card(740, 150, 330, 56, { rx: 10, text: 'Seq Scan on items\nrows=1000000', fs: 15, mono: true, stroke: BAD, color: BAD, s: pop(u, 1.4) });
      sub(740, 210, '하나도 빠짐없이 읽었다', fade(u, 1.8)); return; }
    if (k === 3) { tx(580, 80, 'Sort: top-N heapsort (상위 10개만 유지)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.2) });
      for (let i = 0; i < 10; i++) { const s0 = pop(u, 0.4 + i * 0.12); card(605 + (i % 5) * 64, 130 + Math.floor(i / 5) * 56, 54, 44, { rx: 8, text: String(i + 1), fs: 15, mono: true, stroke: GOOD, color: GOOD, s: s0 }); }
      mono(740, 270, 'recall 100%', { 'font-size': 18, 'font-weight': 800, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 1.8) });
      mono(740, 305, `Execution Time ${Math.round(1248 * E(u, 0.2, 2.0))} ms`, { 'font-size': 16, 'font-weight': 800, fill: BAD, 'text-anchor': 'middle' }); return; }
    // k4: O(n)
    const ax = axes(600, 70, 300, 210, { x: [0, 4], y: [0, 5000], xt: [0, 1, 2, 3, 4], yt: [0, 2500, 5000], xl: '행 수 (백만)', yl: 'ms (예시)' });
    line(ax, [[0, 0], [1, 1248], [2, 2496], [4, 4992]], E(u, 0.2, 1.6), BAD, { sw: 3 });
    el('circle', { cx: ax.X(1), cy: ax.Y(1248), r: 6, fill: BAD, opacity: fade(u, 0.6) }); mono(ax.X(1) + 10, ax.Y(1248) + 4, '1248ms', { 'font-size': 14, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.6) });
    tx(740, 375, '행이 두 배면 시간도 두 배 · O(n)', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.8) }); }

  // 2. IVFFlat 빌드 — k-means 로 구역 나누기
  function pts(o) { o = o || {}; P.forEach((p, i) => { const lab = o.lab ? o.lab[i] : -1, col = lab >= 0 ? CCOL[lab] : OFF, s = o.u == null ? 1 : clamp(o.u * P.length - i);
      if (s <= 0) return; el('circle', { cx: p[0], cy: p[1], r: (o.r || 5) * (0.4 + 0.6 * s), fill: col, opacity: (o.op ? o.op(i) : 0.85) }); }); }
  function cents(cs, s, o) { o = o || {}; cs.forEach((c, j) => { if (o.only && !o.only(j)) return; el('circle', { cx: c[0], cy: c[1], r: 13 * s, fill: PANEL, stroke: CCOL[j], 'stroke-width': 3 }); xmark(c[0], c[1], s * 0.8, CCOL[j]); }); }
  function cenAt(f) { const i = Math.min(HIST.length - 2, Math.floor(f)), r = clamp(f - i); return HIST[i].map((c, j) => [lerp(c[0], HIST[i + 1][j][0], r), lerp(c[1], HIST[i + 1][j][1], r)]); }
  function s2(t, c) { const { k, u } = c;
    frame(k === 0 ? '임베딩 공간 (2차원으로 줄여 그림)' : 'IVFFlat 빌드 · lists=100 (그림은 6구역)');
    if (k === 0) { pts({ u: E(u, 0.2, 1.6) }); pill(740, 150, '100만 행 INSERT 완료', INK, pop(u, 0.4), { fs: 15 });
      tx(740, 210, 'k-means 를 배울 재료가 먼저 있어야 한다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      sub(740, 240, '빈 표에 만들면 구역이 엉뚱하게 잡힌다', fade(u, 1.6)); return; }
    if (k === 1) { pts(); cents(HIST[0], pop(u, 1.0));
      snippet(560, 70, ['CREATE INDEX items_embedding_ivfflat_idx', '  ON items', '  USING ivfflat (embedding vector_l2_ops)', '  WITH (lists = 100);'], { fs: 13.5, op: fade(u, 0.2) });
      sub(740, 230, '시작 중심은 아무 데나 놓인다', fade(u, 1.4), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
    if (k === 2) { const f = (HIST.length - 1) * E(u, 0.2, 2.4), cs = cenAt(f); pts({ lab: assign(cs) }); cents(cs, 1);
      mono(740, 120, `k-means 반복 ${Math.min(HIST.length - 1, Math.floor(f) + (f > 0 ? 1 : 0))}회`, { 'font-size': 18, 'font-weight': 800, 'text-anchor': 'middle' });
      sub(740, 156, '① 가까운 중심에 배정  ② 중심 = 배정된 점의 평균', 1, { 'font-size': 14.5 });
      sub(740, 200, '중심이 더 움직이지 않으면 끝', fade(u, 2.2), { fill: GOOD, 'font-weight': 700 }); return; }
    // k3, k4: posting list
    const extra = k === 4 ? [[470, 345], [490, 365], [455, 372], [500, 330], [480, 385], [440, 352]] : [];
    P.forEach((p, i) => { const g = k === 3 ? E(u, 0.2 + (i % 22) * 0.03, 1.0 + (i % 22) * 0.03) : 1; grow(CEN[LAB[i]][0], CEN[LAB[i]][1], lerp(CEN[LAB[i]][0], p[0], 1), lerp(CEN[LAB[i]][1], p[1], 1), g, CCOL[LAB[i]], { plain: true, sw: 1, op: 0.35 }); });
    pts({ lab: LAB }); cents(CEN, 1);
    const sizes = CEN.map((_, j) => LAB.filter((l) => l === j).length);
    tx(570, 66, 'Inverted File (구역 → 행 목록)', { 'font-size': 14.5, 'font-weight': 700 });
    CEN.forEach((_, j) => { const y = 92 + j * 40, n = sizes[j] + (k === 4 && j === LAB[0] ? 0 : 0); xmark(586, y + 9, 0.6, CCOL[j]);
      const w = n * 9 * (k === 3 ? E(u, 0.6 + j * 0.15, 1.4 + j * 0.15) : 1); el('rect', { x: 604, y, width: w, height: 18, rx: 3, fill: CCOL[j], opacity: 0.7 });
      mono(612 + w, y + 14, `${n}점`, { 'font-size': 13.5, fill: MUT, opacity: k === 3 ? fade(u, 1.4 + j * 0.15) : 1 }); });
    if (k === 4) { extra.forEach((p, i) => { const s0 = pop(u, 0.2 + i * 0.12); el('circle', { cx: p[0], cy: p[1], r: 6 * s0, fill: PANEL, stroke: INK, 'stroke-width': 2.5 }); });
      tx(740, 360, '새 행은 기존 중심 목록에 끼워질 뿐, 중심은 그대로', { 'font-size': 14.5, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 1.2) });
      pill(740, 392, 'REINDEX INDEX items_embedding_ivfflat_idx', WARN, pop(u, 1.8), { mono: true, fs: 13.5 }); } }

  // 3. IVFFlat 검색 — probes 개 구역만 연다
  const BENCH = [['Seq Scan', 1200, '100%', BAD], ['probes=1', 12, '70%', INFO], ['probes=10', 65, '95%', ACC], ['probes=50', 240, '99%', WARN]];
  function probeView(nOpen, u, o) { o = o || {}; const open = new Set(CORD.slice(0, nOpen));
    CEN.forEach((cc, j) => { if (!open.has(j)) return; const m = P.filter((_, i) => LAB[i] === j), rr = Math.sqrt(Math.max(...m.map((p) => d2(p, cc)))) + 10;
      el('circle', { cx: cc[0], cy: cc[1], r: rr * (o.grow ?? 1), fill: CCOL[j], opacity: 0.1, stroke: CCOL[j], 'stroke-width': 2, 'stroke-dasharray': '6 5' }); });
    pts({ lab: LAB, op: (i) => (open.has(LAB[i]) ? 0.9 : 0.15) }); cents(CEN, 0.8);
    star(Q[0], Q[1], 1, BAD);
    let found = 0; TRUE10.forEach((i) => { const ok = open.has(LAB[i]); if (ok) found++;
      el('circle', { cx: P[i][0], cy: P[i][1], r: 9, fill: 'none', stroke: ok ? GOOD : BAD, 'stroke-width': 2.5, opacity: o.ring ?? 1 }); });
    return found; }
  function s3(t, c) { const { k, u } = c;
    if (k <= 3) { frame(`검색 · 열린 구역 ${[0, 1, 2, 4][k]}개 (그림)`);
      const nOpen = [0, 1, 2, 4][k], g = k === 0 ? 1 : E(u, 0.2, 0.9), found = probeView(nOpen, u, { grow: g, ring: k === 0 ? 0 : fade(u, 1.0) });
      if (k === 0) { CORD.slice(0, 2).forEach((j, i) => grow(Q[0], Q[1], CEN[j][0], CEN[j][1], E(u, 0.6 + i * 0.3, 1.2 + i * 0.3), MUT, { plain: true, dash: '4 4' }));
        pill(740, 110, 'ivfflat.probes = 1  (기본값)', ACC, pop(u, 0.3), { mono: true, fs: 14 });
        sub(740, 150, '질의와 가까운 중심부터 순서를 매긴다', fade(u, 1.2), { 'font-size': 15, fill: INK, 'font-weight': 700 }); return; }
      mono(560, 80, ['', 'SET ivfflat.probes = 10;', 'BEGIN; SET LOCAL ivfflat.probes = 10;', 'lists = √N · probes = √lists'][k], { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: fade(u, 0.2) });
      if (k === 3) { mono(560, 108, '100만 행 → lists 1000 → probes ≈ 32', { 'font-size': 14, fill: MUT, opacity: fade(u, 0.6) }); }
      tx(560, 160, `진짜 이웃 10개 중 ${found}개 찾음 (그림)`, { 'font-size': 16, 'font-weight': 800, fill: found >= 9 ? GOOD : found >= 6 ? WARN : BAD, opacity: fade(u, 1.2) });
      el('circle', { cx: 572, cy: 196, r: 8, fill: 'none', stroke: GOOD, 'stroke-width': 2.5 }); tx(588, 201, '열린 구역 안 = 찾음', { 'font-size': 13.5, fill: MUT });
      el('circle', { cx: 572, cy: 222, r: 8, fill: 'none', stroke: BAD, 'stroke-width': 2.5 }); tx(588, 227, '닫힌 구역 = 놓침', { 'font-size': 13.5, fill: MUT });
      if (k === 1) sub(740, 290, '1구역 ≈ 1만 행만 훑는다 · 12ms · recall 70% (예시)', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      if (k === 2) { el('rect', { x: 556, y: 250, width: 370, height: 70, rx: 10, fill: 'none', stroke: INK, 'stroke-width': 1.8, 'stroke-dasharray': '6 5', opacity: fade(u, 0.4) });
        tx(570, 278, 'SET LOCAL = 이 트랜잭션 안에서만', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.5) }); tx(570, 304, 'COMMIT 뒤엔 원래 값으로', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.7) }); }
      if (k === 3) sub(740, 290, '구역을 더 열면 경계 너머 이웃도 잡힌다', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      return; }
    if (k === 4) { tx(60, 60, 'probes 별 지연과 recall (100만 행, lists=100, 예시)', { 'font-size': 15, 'font-weight': 700 });
      const max = 1200, L = (v) => (Math.log10(v) / Math.log10(max)) * 520;
      BENCH.forEach(([n, ms, rc, col], i) => { const y = 100 + i * 66, g = E(u, 0.2 + i * 0.3, 1.0 + i * 0.3);
        tx(60, y + 20, n, { 'font-size': 15, 'font-weight': 700, class: 'mono' }); el('rect', { x: 200, y, width: L(ms) * g, height: 28, rx: 4, fill: col, opacity: 0.8 });
        mono(208 + L(ms) * g, y + 19, `${ms}ms`, { 'font-size': 14.5, 'font-weight': 700, fill: col, opacity: g });
        mono(900, y + 20, rc, { 'font-size': 17, 'font-weight': 800, 'text-anchor': 'end', fill: col, opacity: fade(u, 0.8 + i * 0.3) }); });
      mono(900, 90, 'recall', { 'font-size': 13.5, fill: MUT, 'text-anchor': 'end' }); sub(370, 378, '막대 길이는 로그 눈금', 1);
      el('rect', { x: 52, y: 222, width: 860, height: 40, rx: 8, fill: 'none', stroke: GOOD, 'stroke-width': 2.5, opacity: fade(u, 1.9) });
      tx(560, 404, 'probes=10 이 균형점 · 그 뒤로는 시간만 크게 는다', { 'font-size': 15, 'font-weight': 700, fill: GOOD, 'text-anchor': 'middle', opacity: fade(u, 2.1) }); return; }
    // k5: faiss 실측 곡선
    const NP = [1, 2, 4, 8, 16, 32, 64], RC = [0.314, 0.472, 0.655, 0.822, 0.945, 0.991, 1.0];
    const ax = axes(110, 60, 470, 290, { x: [0, 6], y: [0, 1], xt: [], yt: [0, 0.5, 1], grid: true, xl: 'probes (lists=316)', yl: 'recall@10' });
    NP.forEach((n, i) => mono(ax.X(i), 372, String(n), { 'font-size': 13.5, fill: MUT, 'text-anchor': 'middle' }));
    const g = E(u, 0.2, 2.0); line(ax, RC.map((r, i) => [i, r]), g, ACC, { sw: 3 });
    RC.forEach((r, i) => { if (g * 6 < i - 0.01) return; el('circle', { cx: ax.X(i), cy: ax.Y(r), r: 5.5, fill: ACC }); mono(ax.X(i), ax.Y(r) - 12, r.toFixed(2), { 'font-size': 13.5, 'font-weight': 700, 'text-anchor': 'middle', fill: ACC }); });
    tx(640, 90, 'faiss-cpu 실측', { 'font-size': 16, 'font-weight': 800, opacity: fade(u, 0.3) });
    tx(640, 118, '합성 벡터 10만 개 · 128차원 · lists=316', { 'font-size': 13.5, fill: MUT, opacity: fade(u, 0.4) });
    [['probes', '훑은 비율', 'recall'], ['1', '0.3%', '0.31'], ['4', '1.3%', '0.66'], ['16', '5.1%', '0.95'], ['32', '10.1%', '0.99']].forEach((r, i) => { const y = 160 + i * 32, op = fade(u, 0.6 + i * 0.25);
      r.forEach((s, j) => mono(650 + j * 100, y, s, { 'font-size': 14.5, 'font-weight': i ? 400 : 700, fill: i ? (j === 2 ? ACC : INK) : MUT, opacity: op })); });
    tx(640, 340, '비용은 probes 에 정비례, recall 은 점점 덜 오른다', { 'font-size': 14.5, 'font-weight': 700, fill: GOOD, opacity: fade(u, 2.0) }); }

  // 4. HNSW — 층 그래프를 만들고 위에서 내려온다
  const N0 = [[30, 40], [90, 20], [150, 55], [210, 25], [270, 60], [330, 30], [390, 50], [450, 22], [60, 80], [130, 95], [200, 85], [260, 100], [320, 90], [380, 100], [440, 80], [500, 60]];
  const L1 = [1, 4, 6, 9, 11, 14], L2 = [4, 9, 14];
  const LY = [320, 205, 90];   // Layer 0, 1, 2 의 위 가장자리
  const pos = (n, L) => [70 + N0[n][0] + N0[n][1] * 0.6, LY[L] + N0[n][1] * 0.55];
  const near = (ids, m) => { const E2 = []; ids.forEach((a) => { ids.filter((b) => b !== a).sort((x, y) => d2(N0[a], N0[x]) - d2(N0[a], N0[y])).slice(0, m).forEach((b) => { if (!E2.some(([p, q]) => (p === b && q === a))) E2.push([a, b]); }); }); return E2; };
  const E0 = near(N0.map((_, i) => i), 2).concat([[0, 1], [3, 4], [6, 7], [10, 11], [13, 14]]), E1 = near(L1, 2), E2l = near(L2, 2);
  const QH = [300, 62];
  function layer(L, title, op) { const y = LY[L]; el('path', { d: `M70,${y - 8} L590,${y - 8} L650,${y + 72} L130,${y + 72} Z`, fill: 'var(--soft)', stroke: GRID, 'stroke-width': 1.5, opacity: op });
    tx(668, y + 40, title, { 'font-size': 14.5, 'font-weight': 700, fill: MUT, opacity: op }); }
  function graph(L, ids, edges, g, col, o) { o = o || {};
    edges.forEach(([a, b], i) => { const p = pos(a, L), q = pos(b, L), gg = clamp(g * edges.length - i); if (gg > 0) el('line', { x1: p[0], y1: p[1], x2: lerp(p[0], q[0], gg), y2: lerp(p[1], q[1], gg), stroke: col, 'stroke-width': 1.8, opacity: 0.7 }); });
    ids.forEach((n) => { const p = pos(n, L), hot = o.hot && o.hot.includes(n); el('circle', { cx: p[0], cy: p[1], r: hot ? 8 : 6, fill: hot ? BAD : col, stroke: PANEL, 'stroke-width': 1.5 }); }); }
  function s4(t, c) { const { k, u } = c;
    layer(2, 'Layer 2', k >= 3 ? 1 : 0.35); layer(1, 'Layer 1', k >= 2 ? 1 : 0.35); layer(0, 'Layer 0 (모든 점)', k >= 1 ? 1 : 0.35);
    if (k === 0) { snippet(560, 6, ['USING hnsw (embedding vector_l2_ops)', 'WITH (m = 16, ef_construction = 64);'], { fs: 13.5, op: fade(u, 0.2) });
      tx(330, 250, 'train 이 없다 → 빈 표에도 만든다', { 'font-size': 16, 'font-weight': 800, 'text-anchor': 'middle', fill: GOOD, opacity: fade(u, 1.0) }); return; }
    const all = N0.map((_, i) => i);
    graph(0, all, E0, k === 1 ? E(u, 0.3, 2.0) : 1, INFO);
    if (k === 1) { tx(560, 30, 'm = 이웃 링크 수 (그림은 2개씩)', { 'font-size': 14.5, 'font-weight': 700, opacity: fade(u, 0.3) }); sub(700, 56, 'm ↑ → recall ↑ · 메모리 ↑', fade(u, 1.2)); return; }
    graph(1, L1, E1, k === 2 ? E(u, 0.3, 1.6) : 1, ACC);
    if (k === 2) { tx(560, 30, 'ef_construction = 64', { 'font-size': 15, 'font-weight': 700, class: 'mono', opacity: fade(u, 0.3) });
      sub(720, 56, '빌드 때 후보를 넓게 볼수록 링크가 좋아진다', fade(u, 1.0)); sub(720, 80, '빌드는 느려지고 검색 속도와는 무관', fade(u, 1.6)); return; }
    graph(2, L2, E2l, k === 3 ? E(u, 0.3, 1.2) : 1, WARN);
    L1.forEach((n, i) => { const a = pos(n, 0), b = pos(n, 1); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: MUT, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: k === 3 ? fade(u, 1.0) : 0.6 }); });
    L2.forEach((n) => { const a = pos(n, 1), b = pos(n, 2); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: MUT, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: k === 3 ? fade(u, 1.0) : 0.6 }); });
    if (k === 3) { tx(700, 18, 'faiss 실측 (10만 점, M=16)', { 'font-size': 13.5, 'font-weight': 700, fill: MUT, opacity: fade(u, 1.4), 'text-anchor': 'start' });
      [['Layer 2 이상', '371'], ['Layer 1 이상', '6,374'], ['Layer 0', '100,000']].forEach(([a, b], i) => { mono(800, LY[2 - i] + 62, b, { 'font-size': 15, 'font-weight': 800, fill: [WARN, ACC, INFO][i], 'text-anchor': 'end', opacity: fade(u, 1.6 + i * 0.2) }); });
      return; }
    // k4: 검색 경로 — 위층에서 진입, 가까운 쪽으로 내려온다
    const path = [[2, 14], [2, 9], [1, 9], [1, 11], [0, 11], [0, 12], [0, 4]].map(([L, n]) => pos(n, L));
    [2, 1, 0].forEach((L) => { const q = [70 + QH[0] + QH[1] * 0.6, LY[L] + QH[1] * 0.55]; star(q[0], q[1], 0.7, BAD); });
    const gp = E(u, 0.2, 2.4); for (let i = 0; i < path.length - 1; i++) { const gg = clamp(gp * (path.length - 1) - i); if (gg > 0) el('line', { x1: path[i][0], y1: path[i][1], x2: lerp(path[i][0], path[i + 1][0], gg), y2: lerp(path[i][1], path[i + 1][1], gg), stroke: BAD, 'stroke-width': 3.5 }); }
    dot(path, gp < 1 ? gp : 0, BAD, 7);
    tx(700, 18, 'Greedy: 가까운 쪽으로만', { 'font-size': 14.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 0.3) });
    mono(668, LY[0] + 66, 'ef_search 후보 → top-k', { 'font-size': 13.5, 'font-weight': 700, fill: BAD, opacity: fade(u, 2.2) }); }

  // 5. 비교 — 점수판이 한 줄씩 늘어난다
  const ROWS5 = [['빌드 시간', 80, 600, '~80초', '~10분', 0], ['메모리 (원본 대비)', 1.1, 2.5, '~1.1배', '2~3배', 0], ['검색 (recall 95%)', 65, 8, '65ms', '8ms', 1], ['recall 99% 일 때', 240, 18, '240ms', '18ms', 1]];
  function s5(t, c) { const { k, u } = c;
    if (k <= 3) { tx(60, 44, '100만 행 기준 예시 수치', { 'font-size': 13.5, fill: MUT, 'font-weight': 600 });
      el('rect', { x: 600, y: 32, width: 16, height: 12, rx: 2, fill: INFO }); tx(622, 44, 'IVFFlat', { 'font-size': 14, 'font-weight': 700, fill: INFO });
      el('rect', { x: 720, y: 32, width: 16, height: 12, rx: 2, fill: ACC }); tx(742, 44, 'HNSW', { 'font-size': 14, 'font-weight': 700, fill: ACC });
      ROWS5.forEach(([n, a, b, sa, sb, win], i) => { if (i > k) return; const y = 70 + i * 86, g = i === k ? E(u, 0.2, 1.2) : 1, mx = Math.max(a, b), W = 520;
        tx(60, y + 32, n, { 'font-size': 15, 'font-weight': 700 });
        el('rect', { x: 240, y: y + 8, width: Math.max(3, (W * a) / mx * g), height: 22, rx: 4, fill: INFO, opacity: 0.85 }); mono(248 + (W * a) / mx * g, y + 25, sa, { 'font-size': 14, 'font-weight': 700, fill: INFO, opacity: g });
        el('rect', { x: 240, y: y + 36, width: Math.max(3, (W * b) / mx * g), height: 22, rx: 4, fill: ACC, opacity: 0.85 }); mono(248 + (W * b) / mx * g, y + 53, sb, { 'font-size': 14, 'font-weight': 700, fill: ACC, opacity: g });
        pill(880, y + 33, win ? 'HNSW 승' : 'IVFFlat 승', win ? ACC : INFO, i === k ? pop(u, 1.4) : 1, { fs: 14 }); });
      if (k === 2) sub(560, 404, '위층에서 멀리 점프해 후보를 단숨에 좁힌다 · 약 8배', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      if (k === 3) sub(560, 404, 'IVFFlat 은 probes 를 크게, HNSW 는 ef_search 를 조금만', fade(u, 1.8), { 'font-weight': 700, fill: INK });
      return; }
    if (k === 4) { [['IVFFlat', INFO, ['빈 표에 만들면 구역이 엉뚱 → recall ↓', '새 행이 늘어도 중심은 그대로', '대량 추가 뒤 REINDEX'], false], ['HNSW', ACC, ['빈 표에도 생성', '새 행은 그래프에 바로 편입', '재학습 없음'], true]].forEach(([n, col, items, good], i) => {
        const x = 60 + i * 450; card(x + 200, 210, 400, 290, { rx: 12, stroke: col, sw: 2.2, s: pop(u, 0.2 + i * 0.5) });
        tx(x + 24, 98, n, { 'font-size': 20, 'font-weight': 800, fill: col, opacity: fade(u, 0.3 + i * 0.5) });
        items.forEach((s, j) => { const s0 = pop(u, 0.6 + i * 0.5 + j * 0.25); if (good) check(x + 34, 150 + j * 60, 9, s0); else cross(x + 34, 150 + j * 60, 8, s0);
          tx(x + 56, 156 + j * 60, s, { 'font-size': 15, 'font-weight': 600, opacity: clamp(s0) }); }); });
      return; }
    if (k === 5) { [['IVFFlat 을 고를 때', INFO, ['메모리가 빠듯하다', '한 번 넣고 거의 안 바뀌는 대용량 배치', '빌드를 빨리 끝내야 한다']], ['HNSW 를 고를 때', ACC, ['실시간으로 행이 추가된다', 'recall 95~99% 가 필요하다', '검색 지연이 가장 중요하다']]].forEach(([n, col, items], i) => {
        const x = 60 + i * 450; tx(x, 80, n, { 'font-size': 18, 'font-weight': 800, fill: col, opacity: fade(u, 0.2 + i * 0.6) });
        items.forEach((s, j) => { const y = 120 + j * 64, s0 = pop(u, 0.4 + i * 0.6 + j * 0.2); card(x + 190, y + 10, 380, 48, { rx: 24, stroke: col, sw: 1.8, s: s0 }); tx(x + 22, y + 16, s, { 'font-size': 15, 'font-weight': 600, opacity: clamp(s0) }); }); });
      tx(480, 380, '요즘 pgvector 에서는 보통 HNSW 부터 본다', { 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', opacity: fade(u, 2.0) }); return; }
    // k6: 저울
    const tilt = 0; el('line', { x1: 480, y1: 120, x2: 480, y2: 340, stroke: INK, 'stroke-width': 4 }); el('path', { d: 'M440,350 L520,350 L480,320 Z', fill: INK });
    const ax = (s) => [480 + s * 260 * Math.cos(tilt), 120 + s * 260 * Math.sin(tilt) * -1];
    const [lx, ly] = ax(-1), [rx, ry] = ax(1); el('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: INK, 'stroke-width': 4 });
    card(lx, ly + 70, 300, 96, { rx: 12, text: 'IVFFlat\n빠른 빌드 · 적은 메모리\nrecall 조금 양보', fs: 15, stroke: INFO, s: pop(u, 0.6) });
    card(rx, ry + 70, 300, 96, { rx: 12, text: 'HNSW\n빠른 검색 · 높은 recall\n느린 빌드 · 많은 메모리', fs: 15, stroke: ACC, s: pop(u, 0.9) }); }

  const quiz = [
    { q: '인덱스 없이 ORDER BY embedding <=> $1 LIMIT 10을 돌리면 어떤 일이 생기는가?',
      o: ['B-tree 인덱스가 대신 쓰인다', '100만 행을 모두 읽어 거리를 계산하고 top-N heapsort로 10개를 남긴다', '처음 10행만 읽고 끝난다'], a: 1,
      why: '거리 정렬에는 B-tree를 못 쓴다. 정확도는 100%지만 예시에서 1,248ms가 걸리고 행 수에 비례해 늘어난다.' },
    { q: 'IVFFlat 인덱스를 데이터를 넣은 뒤에 만들어야 하는 이유는 무엇인가?',
      o: ['CREATE INDEX 때 k-means로 구역 중심을 배우기 때문', 'HNSW와 이름이 겹치지 않게 하려고', '빈 표에는 vector 컬럼을 만들 수 없어서'], a: 0,
      why: '빌드 때 임베딩을 샘플링해 lists개 중심을 정한다. 이후 들어온 행은 중심을 바꾸지 못해 대량 추가 뒤에는 REINDEX가 필요하다.' },
    { q: 'ivfflat.probes를 1에서 10으로 올리면 무엇이 달라지는가?',
      o: ['인덱스가 다시 만들어진다', '구역 수 lists가 10배가 된다', '더 많은 구역을 열어 recall이 오르고 시간도 는다'], a: 2,
      why: '예시에서 probes=1은 12ms·70%, probes=10은 65ms·95%다. 경계 너머 이웃을 잡는 대신 훑는 행이 늘어난다.' },
    { q: 'HNSW 검색이 Layer 2에서 시작하는 이유는 무엇인가?',
      o: ['Layer 2에 모든 점이 들어 있어서', '점이 적은 위층에서 멀리 점프해 후보 범위를 빨리 좁히려고', 'Layer 2만 디스크에 있어서'], a: 1,
      why: '위층은 점이 드물어 한 번에 멀리 간다. 가까운 쪽으로 내려와 모든 점이 있는 Layer 0에서 ef_search만큼 후보를 보며 top-k를 낸다.' },
    { q: '행이 실시간으로 계속 추가되고 높은 recall이 필요한 서비스에 맞는 인덱스는 무엇인가?',
      o: ['HNSW', 'IVFFlat', '인덱스 없이 Seq Scan'], a: 0,
      why: 'HNSW는 새 행을 그래프에 바로 편입하고 같은 recall에서 검색이 빠르다. 대신 빌드가 느리고 메모리를 2~3배 쓴다.' },
  ];
  const summary = [
    '인덱스가 없으면 100만 행을 모두 읽어 예시로 1,248ms가 걸리고 행 수에 비례해 는다.',
    'IVFFlat은 k-means로 구역을 나누고 probes개 구역만 열어 본다.',
    'probes를 올리면 recall은 오르지만 훑는 행도 같이 늘고 이득은 점점 준다.',
    'HNSW는 빌드가 느리고 메모리를 더 쓰지만 검색이 빠르고 새 행을 바로 받는다.',
  ];
  const review = [
    { q: 'IVFFlat 인덱스를 만든 뒤 한 달 동안 새 데이터를 두 배로 넣었더니 recall이 떨어졌다. 먼저 할 일은?',
      o: ['REINDEX로 k-means 중심을 다시 배운다', 'ivfflat.probes를 1로 낮춘다', 'B-tree 인덱스를 하나 더 만든다'], a: 0,
      why: 'IVFFlat 중심은 빌드 때 정해지고 새 행은 기존 구역에 끼워질 뿐이다. 분포가 바뀌면 다시 학습해야 구역이 맞아진다.' },
    { q: 'IVFFlat에서 probes=10으로 recall 95%를 얻었는데 99%가 필요하다. 예시 수치로 보아 가장 알맞은 판단은?',
      o: ['probes를 50으로 올려 약 240ms를 감수하거나, HNSW로 바꿔 ef_search를 조금 올린다', 'lists를 1로 줄인다', 'LIMIT을 10에서 5로 줄인다'], a: 0,
      why: 'IVFFlat은 99%에 240ms가 들지만 HNSW는 18ms 수준이다. recall 상한이 중요하면 HNSW가 맞다.' },
    { q: '메모리가 작은 서버에 한 번 적재하고 거의 바뀌지 않는 수백만 벡터를 올린다. 어떤 인덱스가 맞는가?',
      o: ['HNSW, m을 최대로', 'IVFFlat', '인덱스 없이 Seq Scan'], a: 1,
      why: 'IVFFlat은 원본의 약 1.1배 메모리로 빌드도 빠르다. 데이터가 거의 안 바뀌니 REINDEX 부담도 작다.' },
  ];

  R.page({ title: 'IVFFlat vs HNSW', scenes: [s1, s2, s3, s4, s5], quiz, summary, review });
})();
